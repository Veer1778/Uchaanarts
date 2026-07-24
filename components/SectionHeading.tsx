/**
 * SectionHeading — editorial section masthead: diamond markers, a caps kicker
 * on a hairline, and a large serif title whose accent word sits in a red
 * highlight block.
 */
export default function SectionHeading({
  title,
  kicker,
  accentWord,
}: {
  title: string;
  kicker?: string;
  accentWord?: string;
}) {
  const parts = accentWord ? title.split(accentWord) : [title];

  return (
    <div className="mb-10">
      <div className="mb-4 flex items-center gap-3">
        <span className="diamond bg-signal" />
        <span className="diamond bg-gold" />
        {kicker && (
          <>
            <span className="ml-1 h-px flex-1 bg-line" />
            <p className="label shrink-0 text-muted">{kicker}</p>
          </>
        )}
      </div>
      <h2 className="font-display text-4xl leading-[1.05] sm:text-5xl">
        {accentWord && parts.length === 2 ? (
          <>
            {parts[0]}
            <span className="highlight">{accentWord}</span>
            {parts[1]}
          </>
        ) : (
          title
        )}
      </h2>
    </div>
  );
}
