import Image from "next/image";

type ShowBannerProps = {
  src: string;
  alt: string;
};

export function ShowBanner({ src, alt }: ShowBannerProps) {
  return (
    <section className="mx-auto w-full px-4 sm:px-6 lg:px-0">
      <div className="relative mx-auto w-full overflow-hidden rounded-2xl lg:max-w-3xl">
        <Image
          src={src}
          alt={alt}
          width={577}
          height={640}
          sizes="(max-width: 1024px) 100vw, 768px"
          className="h-auto w-full object-cover"
          priority
        />
      </div>
    </section>
  );
}
