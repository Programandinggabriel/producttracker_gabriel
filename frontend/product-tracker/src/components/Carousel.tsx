'use client'

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export type Image = {
    id: number;
    src: string;
    alt: string
}

type CarouselProps = {
    images: Array<Image>
}

export default function Carousel({ images }:CarouselProps){
    const [activeIndex, setActiveIndex] = useState(0);
    const thumbnailsRef = useRef<HTMLDivElement>(null);
    const activeImage = images[activeIndex];
    
    const selectImage = (index: number) => {
        if (index < 0 || index >= images.length) return;

        setActiveIndex(index);
    };

    const shimmerB64 = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PC9zdmc+"


    const handleNext = () => {
        if (activeIndex < images.length - 1) {
            selectImage(activeIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (activeIndex > 0) {
        selectImage(activeIndex - 1);
        }
    };

    useEffect(() => {
        const container = thumbnailsRef.current;

        if (!container) return;

        const thumbnail = container.children[
            activeIndex
        ] as HTMLElement | undefined;

        thumbnail?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
        });
    }, [activeIndex]);

    if (!images.length) {
        return null;
    }
    
    return(
    <>
        <div className="w-full">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg">
                <Image
                    src={activeImage?.src ?? null}
                    alt={activeImage?.alt ?? ""}
                    fill
                    priority
                    loading="eager"
                    sizes="(max-width: 768px) 100vw, 80vw"
                    placeholder="blur"
                    blurDataURL={shimmerB64}
                    className="object-cover transition-opacity duration-300"
                />
                {activeIndex > 0 
                    ? <button
                        type="button"
                        onClick={handlePrevious}
                        aria-label="Imagen anterior"
                        className="absolute left-3 top-1/2 z-10 flex h-9 w-9 translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white"
                        >
                            <svg
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M15 19l-7-7 7-7"
                                />
                            </svg>
                        </button>
                    : ''
                }

                {activeIndex < images.length - 1
                    ?<button
                        type="button"
                        onClick={handleNext}
                        aria-label="Imagen siguiente"
                        className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white"
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </button>
                : ''
                }

                <div className="absolute bottom-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {activeIndex + 1} / {images.length}
                </div>
            </div>

            <div className="relative mt-2 w-full">
                <div 
                    ref={thumbnailsRef}
                    className="flex flex-row items-center gap-1 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-1 scrollbar-none cursor-grab active:cursor-grabbing">
                    {
                        images.map((image, index) => {
                            const isActive = index === activeIndex;

                            return (
                                <button
                                    key={image.id}
                                    type="button"
                                    aria-label={`Ver imagen ${index + 1}`}
                                    aria-current={isActive ? "true" : undefined}
                                    className={`relative h-16 w-20 shrink-0 snap-start overflow-hidden rounded-md border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${isActive ? "border-blue-600 opacity-100" : "border-transparent opacity-60 hover:opacity-100"}`}
                                >
                                    <Image
                                        key={image.id}
                                        src={image.src}
                                        alt={image.alt ?? ""}
                                        fill
                                        sizes="80px"
                                        className="object-cover"
                                        placeholder="blur"
                                        blurDataURL={shimmerB64}
                                        loading="eager"
                                    />
                                    <span className="absolute inset-0 bg-blue-600/10" />
                                </button>
                            );
                        })
                    }
                </div>
            </div>
        </div> 
    </>
    )
}