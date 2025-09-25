"use client";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function BannerCarousel({ images }: { images: string[] }) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [images.length]);

    return (
        <div className="relative w-full max-w-3xl h-100 mx-auto overflow-hidden rounded-lg">
            <Image
                src={images[index]}
                alt={`banner-${index}`}
                fill
                priority
                className="object-cover"
            />

            {/* 인디케이터 */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                    <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${i === index ? "bg-white" : "bg-white/40"
                            }`}
                    />
                ))}
            </div>
        </div>

    );
}
