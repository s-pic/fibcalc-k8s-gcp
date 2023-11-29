# About

Following a course about docker and k8s https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/

We took the repo from the previous section and added k8s configuration files to it, in order to deploy to google cloud k8s cluster instead of AWS beanstalk.

Here we have configuration files for 
- our deployments
- multiple custer IP Services for deployments
- an ingress service
- a postgres PVC

Lessons learned while creating this project (compared to what was done in k8s-simple already):

## General mental model and how-to
- kubernetes is a system for running many different containers over multiple different machines. It shines in scaling and managing (updating, wiring up, ..) containers
- a kubernetes cluster is formed by a master node (controls what each node does using a set of go programs) and multiple worker nodes. A node runs on a VM or a physical computer
- kubernetes expects all images already to be built (in contrast to docker-compose)
- we have multiple objects, declared in config files (declarative approach). We can have one file per object or describe multiple objects in a single file. Files can be applied using `kubectl apply -f <file>`
- networking must be set up explicitly
- we can inspect objects using `kubectl get <object>` (e.g. `kubectl get pods` and `kubectl describe <object>` 

## Building Blocks

### Services 
- services set up networking within a k8s cluster OR networking from outside the cluster
- **ClusterIP Service**: Exposes a set of pods to other objects *within* the cluster. They create an internal DNS entry that equals their `metadata.name` (similar to how it works in docker-compose). They also open up ports for other deployments to point traffic to and forward traffic to the deployment associated with the service
- **NodePort Service**: Exposes a set of pods to the outside world (only good for dev purposes)
- **LoadBalancer Service**: Somewhat deprecated (not clear) way of getting network traffic into a cluster. Usually used in conjunction with a cloud provider. Creates a load balancer that points to a set of pods
- **Ingress Service**: Exposes a set of services to the outside world. Sits in front of the cluster and routes traffic to pods (yep, directly to pods) that sit behind deployments and clusterIP services. There are different implementations, e.g. `ingress-nginx` (community project), `kubernetes-ingress` (lead by company behind nginx). Ingresses are usually used in conjunction with a cloud provider. Similar to how a deployment works as controller (constantly trying to create actions ensuring that the declared desired state of pods is reached looking at the current state), we create ingress routing rules, which get picket up by an ingress service, that then spins up a pod that does the routing. For the example of GCP, we create a load balancer (the GCP one), which then routes traffic to the routing pod managed by the Ingress service, which then routes traffic to pods. We're using the off-the-shelf ingress service (in contrast to making the cloud provider load balancer route traffic to a custom nginx like we did for docker-compose) because it's easier to set up and maintain -- and it also comes with a lot of features like SSL termination, load balancing, etc. E.g. we can have "sticky sessions", ensuring that requests coming from the same user are always routed to the same pod. Read more in this [deep dive about k8s ingress](https://www.joyfulbikeshedding.com/blog/2018-03-26-studying-the-kubernetes-ingress-system.html)).

### Volumes
- In contrast to generic terminology in container terms, where a volume is a mapping from the container fs to the host fs, kubernetes **Volumes** are *at pod level*. So not an option for pods running a DB like postgres. Because when a pod dies, the volume inside the pod dies also.
- a **persistent Volume** is a volume that lives on the cluster, and is not tied to a pod. So when a pod dies, the volume is still there. 
- a **peristent volume claim** is like an advertisement for a persistent volume facing pods. A pod can claim a persistent volume, and then the pod can use it.
Volumes can be statically provisioned (created ahead of time), or dynamically provisioned.


### Secrets
- are created with an imperative command
- are retrieved (e.g. in env block) by stating secret name and key
```
kubectl create secret (generic|docker-registry|tls) <secret-name> --from-literal key=value ## as opposed to from file`
```
An example is
```
kubectl create secret generic fibcalcdb --from-literal PGPASSWORD=THE_PASSWORD_I_CHOSE
```
To retrieve the secret within an object definition do
```
env:
- name: POSTGRES_PASSWORD
  valueFrom:
    secretKeyRef:
      name: fibcalcdb
      key: PGPASSWORD
```