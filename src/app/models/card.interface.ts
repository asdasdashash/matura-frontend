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
  dealerCardIndex?: number;
  revealed?: boolean;
  isGolden?: boolean;
}