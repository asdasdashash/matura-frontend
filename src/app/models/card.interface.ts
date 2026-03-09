export interface Card {
  id: number;
  cardType: string;
  cardSymbol: string;
  cardValue: number;
  imagePath?: string;
  goldenImagePath?: string;
  clicked?: boolean;
  isPlayerCard?: boolean;
  playerCardIndex?: number;
  opponentCardIndex?: number;
  revealed?: boolean;
  isGolden?: boolean;
}