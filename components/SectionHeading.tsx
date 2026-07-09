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
      {kicker && (
        <p className="mb-3 text-[11px] uppercase tracking-[0.3em] text-signal">{kicker}</p>
      )}
      <h2 className="font-display text-4xl leading-tight sm:text-5xl">
        {accentWord && parts.length === 2 ? (
          <>
            {parts[0]}
            <span className="text-signal">{accentWord}</span>
            {parts[1]}
          </>
        ) : (
          title
        )}
      </h2>
    </div>
  );
}
