import { FC, useState } from 'react';
import { useSheetStore } from '../../../stores/useSheetStore';
import { Cell as ICell } from '../../../types/cell';

interface Props {
  cell: ICell;
}

export const Cell: FC<Props> = ({ cell }) => {
  const [value, setValue] = useState(cell.value);

  const changeSheet = useSheetStore((state) => state.onChangeCell);

  const onChangeCell = (value: string) => {
    setValue(value);
  };

  const handleBlur = () => {
    changeSheet(cell, value);
  };

  return (
    <td className="sheet-cell" key={cell.name}>
      <input
        onChange={(e) => onChangeCell(e.target.value)}
        className="sheet-input"
        type="text"
        onBlur={handleBlur}
        value={value}
      />
    </td>
  );
};
