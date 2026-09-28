type HeaderProps = {
  money: number;
  onResetMoney: () => void;
};

export default function Header({ money, onResetMoney }: HeaderProps) {
  return (
    <header>
      <div className="header_inner">
        <h1 className="header_title">競馬ゲーム</h1>
        <button className="reset_button" onClick={onResetMoney}>
          所持金リセット
        </button>
        <h1 className="header_sub">
          所持金: <span className="money">{money}</span> 円
        </h1>
      </div>
    </header>
  );
}
