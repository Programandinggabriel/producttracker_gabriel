import Manager from '@/src/components/Products/Manager'
import { Suspense } from 'react'

export default function Products(){
    return (
        <>
            <Suspense>
                <Manager/>
            </Suspense>
        </>
    )
}