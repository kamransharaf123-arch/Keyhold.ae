import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
};

export function SectionHeading({ eyebrow, title, description, href, linkLabel }: SectionHeadingProps) {
  return (
    <div className="mb-10 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(16rem,0.45fr)] md:items-end">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="display-title mt-3 max-w-3xl text-4xl sm:text-5xl">{title}</h2>
      </div>
      <div className="md:justify-self-end">
        {description ? <p className="max-w-md text-sm leading-7 text-[var(--color-stone)]">{description}</p> : null}
        {href && linkLabel ? (
          <Link href={href} className="text-link mt-5 inline-flex items-center gap-2">
            {linkLabel}
            <ArrowRightIcon className="size-4" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
