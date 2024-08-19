import { FC } from 'react';
import { getSheetNumbers } from '../../../helpers/sheet/get-sheet';
import { generateUUID } from '../../../helpers/uuid';
import { useSheetStore } from '../../../stores/useSheetStore';
import { Cell as ICell } from '../../../types/cell';
import { Cell } from './Cell';

interface Props {
  row: ICell[];
  index: number;
}

export const CellRow: FC<Props> = ({ row, index }) => {
  const rowsQty = useSheetStore((state) => state.rowsQty);

  return (
    <tr className="sheet-row" key={generateUUID()}>
      <td className="sheet-header-cell">{getSheetNumbers(rowsQty)[index]}</td>

      {row.map((cell) => (
        <Cell key={generateUUID()} cell={cell} />
      ))}
    </tr>
  );
};
