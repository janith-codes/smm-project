type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
  eyebrowClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  eyebrowClassName = "text-[#2f80ed]",
  titleClassName = "max-w-2xl",
  descriptionClassName = "text-black/62",
}: SectionHeaderProps) {
  return (
    <div>
      <p
        className={`text-sm font-bold uppercase tracking-[0.18em] ${eyebrowClassName}`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-3 text-4xl font-black tracking-tight sm:text-5xl ${titleClassName}`}
      >
        {title}
      </h2>
      {description ? (
        <p className={`mt-5 max-w-xl text-base leading-7 ${descriptionClassName}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
