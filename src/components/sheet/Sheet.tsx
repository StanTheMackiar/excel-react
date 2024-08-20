import { FC, useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { getSheet, getSheetLetters } from '../../helpers/sheet/get-sheet';
import { generateUUID } from '../../helpers/uuid';
import { useSheetStore } from '../../stores/useSheetStore';
import './Sheet.css';
import { CellRow } from './cells/CellRow';

export const Sheet: FC = () => {
  const [rowsQty, colsQty, sheet, setSheet] = useSheetStore(
    useShallow((state) => [
      state.rowsQty,
      state.colsQty,
      state.sheet,
      state.setSheet,
    ])
  );

  useEffect(() => {
    setSheet(getSheet(rowsQty, colsQty));
  }, [rowsQty, colsQty]);

  return (
    <table className="sheet">
      <thead className="sheet-head">
        <tr className="sheet-row">
          <th className="sheet-header-cell"></th>

          {getSheetLetters(colsQty).map((name) => (
            <th className="sheet-header-cell" key={generateUUID()}>
              {name}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {sheet.map((row, i) => (
          <CellRow key={generateUUID()} index={i} row={row} />
        ))}
      </tbody>
    </table>
  );
};
