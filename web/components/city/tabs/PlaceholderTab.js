export default function PlaceholderTab({ title, desc }) {
  return (
    <>
      <p className="mute">{desc}</p>
      <p className="mute" style={{ fontSize: 12 }}>{title}需要怪物資料/精髓系統(迷宮跟戰鬥階段才會搬過來),先空著。</p>
    </>
  );
}
