import { type ItemProduct } from "@/src/services/products"
import Image from "next/image";

type ItemProductProps = {
    product: ItemProduct
}

export default function Product({product}: ItemProductProps){
    const productImages = product.images;
    const thubnailImage = productImages[0];

    return(
        <>
        <div className="w-full max-w-[300px] bg-neutral-primary-soft p-6 border border-default rounded-base shadow-xs">
            <a href="#">
                <div className="flex justify-center"> 
                    <Image className="rounded-base mb-6" src={thubnailImage} alt="product" width={120} height={120} style={{ width: 'auto', height: 'auto'}}  loading="eager"/>
                </div>
            </a>
            <div>
                <a href="#">
                    <h5 className="text-md text-heading font-semibold tracking-tight">{product.title}</h5>
                </a>
                <div className="flex items-center justify-between mt-6">
                    <span className="text-md font-extrabold text-heading">{`$ ${product.price} ${product.currency}`}</span>
                </div>
            </div>
        </div>
        </>
    )
}