export const PAGE_SIZE = 20;

export type MovementRow = {
  id: string;
  code: string;
  type: string;
  remark: string | null;
  createdAt: Date;
  itemCount: number;
};

export type TxnRow = {
  id: string;
  type: string;
  quantity: number;
  price: number;
  subject: string | null;
  createdAt: Date;
  stock: { id: string; name: string } | null;
};
