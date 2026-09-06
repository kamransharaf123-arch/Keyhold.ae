"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon } from "@/components/icons";
import { ImageReveal } from "@/components/motion";
import type { ProjectImage } from "@/types/real-estate";
import type { KeyHoldLocale } from "@/types/localization";

const COPY = {
  en: {
    gallery: "Project gallery",
    viewAll: (count: number) => `View all ${count} photos`,
    close: "Close gallery",
    previous: "Previous photo",
    next: "Next photo",
    counter: (current: number, total: number) => `${current} / ${total}`,
  },
  fr: {
    gallery: "Galerie du projet",
    viewAll: (count: number) => `Voir les ${count} photos`,
    close: "Fermer la galerie",
    previous: "Photo précédente",
    next: "Photo suivante",
    counter: (current: number, total: number) => `${current} / ${total}`,
  },
} as const;

type GalleryCopy = (typeof COPY)[KeyHoldLocale];

export function ProjectGallery({ images, locale = "en" }: { images: ProjectImage[]; locale?: KeyHoldLocale }) {
  const copy = COPY[locale];
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  if (images.length === 0) return null;

  const [lead, ...rest] = images;
  const secondary = rest.slice(0, 3);
  const remaining = images.length - 4;

  function openAt(index: number, trigger: HTMLButtonElement) {
    triggerRef.current = trigger;
    setOpenIndex(index);
  }

  function close() {
    setOpenIndex(null);
    triggerRef.current?.focus();
  }

  return (
    <>
      <section aria-label={copy.gallery} className="site-container pb-14 lg:pb-20">
        <div className="grid gap-2 lg:grid-cols-[1.45fr_0.55fr]">
          <ImageReveal className="relative aspect-[16/10] bg-[var(--color-warm-grey)]">
            <button
              type="button"
              onClick={(event) => openAt(0, event.currentTarget)}
              className="kh-motion-image absolute inset-0 h-full w-full cursor-zoom-in overflow-hidden"
              aria-label={copy.viewAll(images.length)}
            >
              <Image src={lead.src} alt={lead.alt} fill priority sizes="(max-width: 1024px) 100vw, 70vw" className="object-cover" />
              <span className="absolute bottom-4 left-4 bg-[color:rgba(252,251,248,0.9)] px-3 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-[var(--color-graphite)] backdrop-blur">
                {lead.category}
              </span>
            </button>
          </ImageReveal>
          <div className="grid min-w-0 grid-cols-3 gap-2 lg:grid-cols-1">
            {secondary.map((image, index) => {
              const isLastVisible = index === secondary.length - 1 && remaining > 0;
              return (
                <button
                  key={`${image.src}-${image.category}`}
                  type="button"
                  onClick={(event) => openAt(index + 1, event.currentTarget)}
                  className="kh-motion-image group relative aspect-[4/3] cursor-zoom-in overflow-hidden bg-[var(--color-warm-grey)] lg:aspect-auto lg:min-h-0"
                  aria-label={isLastVisible ? copy.viewAll(images.length) : image.alt}
                >
                  <Image src={image.src} alt={image.alt} fill sizes="(max-width: 1024px) 33vw, 30vw" className="object-cover" />
                  <span className="absolute bottom-2 left-2 bg-[color:rgba(252,251,248,0.88)] px-2 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-graphite)] backdrop-blur">
                    {image.category}
                  </span>
                  {isLastVisible ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-[rgba(27,27,27,0.55)] px-2 text-center text-xs font-semibold text-white sm:text-sm">
                      {copy.viewAll(images.length)}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </section>
      {openIndex !== null ? <GalleryLightbox images={images} startIndex={openIndex} onClose={close} copy={copy} /> : null}
    </>
  );
}

function GalleryLightbox({
  images,
  startIndex,
  onClose,
  copy,
}: {
  images: ProjectImage[];
  startIndex: number;
  onClose: () => void;
  copy: GalleryCopy;
}) {
  const [index, setIndex] = useState(startIndex);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const image = images[index];

  const goPrev = useCallback(() => setIndex((current) => (current - 1 + images.length) % images.length), [images.length]);
  const goNext = useCallback(() => setIndex((current) => (current + 1) % images.length), [images.length]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowLeft") goPrev();
      else if (event.key === "ArrowRight") goNext();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [goPrev, goNext, onClose]);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.gallery}
      className="kh-lightbox fixed inset-0 z-[60] flex flex-col bg-[rgba(17,19,18,0.95)]"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex items-center justify-between p-4 sm:p-6">
        <span className="text-xs uppercase tracking-[0.16em] text-white/70">{copy.counter(index + 1, images.length)}</span>
        <button type="button" onClick={onClose} aria-label={copy.close} className="kh-lightbox-control grid size-10 place-items-center rounded-full border border-white/20">
          <CloseIcon className="size-5" />
        </button>
      </div>
      <div ref={panelRef} tabIndex={-1} className="relative flex-1 px-2 pb-4 outline-none sm:px-6 sm:pb-6">
        <div key={image.src} className="kh-lightbox-image relative h-full w-full">
          <Image src={image.src} alt={image.alt} fill sizes="100vw" className="object-contain" priority />
        </div>
        {images.length > 1 ? (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label={copy.previous}
              className="kh-lightbox-control absolute left-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 sm:left-6"
            >
              <ChevronLeftIcon className="size-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label={copy.next}
              className="kh-lightbox-control absolute right-2 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/20 sm:right-6"
            >
              <ChevronRightIcon className="size-5" />
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
