// TimeSheetTableModel.java
// Display TimeSheet information in a JTable
//
// (c) 2005 David Cuny
// http://jlipsync.sourceforge.net
// Released under Qt Public License


import javax.swing.ImageIcon;
import javax.swing.table.AbstractTableModel;

	// table model for the timesheet
	class TimeSheetTableModel extends AbstractTableModel {
		
		TimeSheet timeSheet;

		String columnNames[] = { "Frame", "Time Code", "Key", "Mouth",
				"Comments" };

		ImageIcon checkMark = Utilities.createImageIcon("images/check.gif");

		ImageIcon noCheckMark = Utilities
				.createImageIcon("images/no_check.gif");

		
		public TimeSheetTableModel(TimeSheet timeSheet) {
			// save data
			this.timeSheet = timeSheet;
		}
		
		public int getColumnCount() {
			return columnNames.length;
		}

		public int getRowCount() {
			return timeSheet.frameCount;
		}

        @Override
		public String getColumnName(int col) {
			return columnNames[col];
		}
		
		public Object getValueAt(int row, int col) {
			switch (col) {
			case TimeSheet.COLUMN_FRAME:
				// frame number
				return row + 1 + "";

			case TimeSheet.COLUMN_TIMECODE:
				return timeSheet.calcTimeCode(row + 1);

			case TimeSheet.COLUMN_KEY:
				// return new Boolean(timeSheetKey[row]);
				if (timeSheet.key[row]) {
					return checkMark;
				} else {
					return noCheckMark;
				}

			case TimeSheet.COLUMN_MOUTH:
				return timeSheet.mouth[row];

			case TimeSheet.COLUMN_COMMENTS:
				return timeSheet.comment[row];
			}

			// shouldn't happen
			return "";
		}

        @Override
		public boolean isCellEditable(int row, int col) {
			// only column 4 is editable
			return (col == TimeSheet.COLUMN_COMMENTS);
		}

        @Override
		public void setValueAt(Object value, int row, int col) {

			switch (col) {
			case TimeSheet.COLUMN_KEY:
				Boolean flag = (Boolean) value;
			timeSheet.key[row] = (flag == Boolean.TRUE);
				break;

			case TimeSheet.COLUMN_MOUTH:
				timeSheet.mouth[row] = (String) value;
				break;

			case TimeSheet.COLUMN_COMMENTS:
				timeSheet.comment[row] = (String) value;
				break;
			}
		}

        @Override
		public Class getColumnClass(int c) {
			return getValueAt(0, c).getClass();
		}
		
	}	
