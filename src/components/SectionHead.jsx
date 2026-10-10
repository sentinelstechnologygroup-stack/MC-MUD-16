export default function SectionHead({ title, level = 2 }) {
  const Heading = level === 1 ? 'h1' : 'h2';
  return (
    <div className="flex items-end justify-between border-b border-[#cbdcde] pb-5 mb-8">
      <Heading className="font-heading text-[26px] lg:text-[35px] leading-[1.12] text-[#143c58]">
        {title}
      </Heading>
      <span className="w-14 h-[3px] bg-[#39a8b8] shrink-0" />
    </div>
  );
}