import clsx from 'clsx';
import { FC, useRef, useState } from 'react';
import { useSheetStore } from '../../../stores/useSheetStore';
import { ICell } from '../../../types/cell';

interface Props {
  cell: ICell;
  onBlur: (cell: ICell, value: string) => void;
}

export const Cell: FC<Props> = ({ cell, onBlur }) => {
  const selectedCells = useSheetStore((state) => state.selectedCells);
  const [value, setValue] = useState(cell.value);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleBlur = () => {
    if (value !== cell.value) {
      onBlur(cell, value);
    }
  };

  const isSelected = selectedCells.size > 1 && selectedCells.has(cell);

  return (
    <td className="sheet-cell" key={cell.id}>
      <input
        onBlur={handleBlur}
        id={cell.id}
        ref={inputRef}
        onChange={(e) => setValue(e.target.value)}
        className={clsx('sheet-input', { selected: isSelected })}
        type="text"
        value={value}
      />
    </td>
  );
};
