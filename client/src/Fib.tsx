import axios from 'axios'
import {ChangeEvent, useCallback, useEffect, useState} from 'react'
import type {FC} from 'react'

const VALUES_API_ROOT_PATH = '/api/values';


export const Fib: FC = () => {
    const [seenIndexes, setSeenIndexes] = useState([])
    const [calculatedValues, setCalculatedValues] = useState({})
    const [indexUserInput, setIndexUserInputUserInput] = useState('')

    useEffect(() => {
        const getValuesPromise = axios.get(`${VALUES_API_ROOT_PATH}/current`)
        const getIndexesPromise = axios.get(`${VALUES_API_ROOT_PATH}/all`)

        Promise.all([getValuesPromise, getIndexesPromise])
            .then(([valuesResponse, indexesResponse]) => {
                setCalculatedValues(valuesResponse.data)
                setSeenIndexes(indexesResponse.data)
            })
    }, [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        await axios.post(VALUES_API_ROOT_PATH, {
            index: indexUserInput
        })

        setIndexUserInputUserInput('')
    }

    const handleInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        const isNumber = !isNaN(Number(value))
        if (isNumber) {
            setIndexUserInputUserInput(value)
        }
    }, [])

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <label>Enter your index (some number below 40):</label>
                <input
                    value={indexUserInput} onChange={handleInput}
                    type={"number"}
                    max={40}
                />
                <button>Submit</button>
            </form>

            <br/>

            <i>You will need to come back to this page to see the result, as the input is processed async</i>

            <h3>Indexes I have seen:</h3>
            {
                seenIndexes.map(({number}) => number).join(', ')
            }


            <h3>Calculated values:</h3>
            <div>
                {
                    calculatedValues &&
                    Object.entries(calculatedValues).map(([key, value]) => (
                        // @ts-ignore
                        <div key={key}>
                            For index {key} I calculated {value}
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Fib