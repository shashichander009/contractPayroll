import {
  initializeBlock,
  useBase,
  useRecords,
  Loader,
  Button,
  Box
} from "@airtable/blocks/ui";
import React, { Fragment, useState } from "react";

const TABLE_NAME = "Salary Gen";
const PAYROLL_DATABSE_TABLE_NAME = "Database";
const NAME_FIELD_NAME = "Name";
const NETSALARY_FIELD_NAME = "netSalarytoBeProcessed";
const BRANCH_FIELD_NAME = "Branch";
const ID_FIELD_NAME = "Unique Id";
const LOP_FIELD_NAME = "lopDays";
const GROSS_SALARY_FIELD_NAME = "Salary Addition";
const TOTAL_DEDUCTION_FIELD_NAME = "totalDeductions";
const BASIC_FIELD_NAME = "basic";
const HRA_FIELD_NAME = "hra";
const STIPEND_FIELD_NAME = "stipend";
const OTHER_EARNINGS_FIELD_NAME = "other earnings";
const PROF_TAX_FIELD_NAME = "proftax";
const PF_EMPLOYER_FIELD_NAME = "pfEmployer";
const PF_EMPLOYEE_FIELD_NAME = "pfEmployee";
const SALARY_ADVANCE_FIELD_NAME = "salary advance";
const MONTH_FIELD_NAME = "monthYear";
const EMAIL_FIELD_NAME = "email";
const MAX_RECORDS_PER_UPDATE = 50;

function PayrollBlock() {
  const base = useBase();
  const table = base.getTableByName(TABLE_NAME);
  const databaseTable = base.getTableByName(PAYROLL_DATABSE_TABLE_NAME);
  const records = useRecords(table);
  const [isUpdateInProgress, setIsUpdateInProgress] = useState(false);

  const permissionCheck = databaseTable.checkPermissionsForCreateRecord(
    undefined,
    {
      [NAME_FIELD_NAME]: undefined,
      [NETSALARY_FIELD_NAME]: undefined,
      [BRANCH_FIELD_NAME]: undefined,
      [ID_FIELD_NAME]: undefined,
      [LOP_FIELD_NAME]: undefined,
      [GROSS_SALARY_FIELD_NAME]: undefined,
      [TOTAL_DEDUCTION_FIELD_NAME]: undefined,
      [BASIC_FIELD_NAME]: undefined,
      [HRA_FIELD_NAME]: undefined,
      [STIPEND_FIELD_NAME]: undefined,
      [OTHER_EARNINGS_FIELD_NAME]: undefined,
      [PROF_TAX_FIELD_NAME]: undefined,
      [PF_EMPLOYER_FIELD_NAME]: undefined,
      [PF_EMPLOYEE_FIELD_NAME]: undefined,
      [SALARY_ADVANCE_FIELD_NAME]: undefined,
      [MONTH_FIELD_NAME]: undefined,
      [EMAIL_FIELD_NAME]: undefined
    }
  );

  async function onButtonClick() {
    setIsUpdateInProgress(true);
    const recordUpdates = await freezeRecords(table, databaseTable, records);
    await updateRecordsInBatchesAsync(table, recordUpdates);
    setIsUpdateInProgress(false);
  }
  return (
    <Box
      position="absolute"
      top="0"
      bottom="0"
      left="0"
      right="0"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      {isUpdateInProgress ? (
        <Loader />
      ) : (
        <Fragment>
          <Button
            iant="primary"
            onClick={onButtonClick}
            disabled={!permissionCheck.hasPermission}
            marginBottom={3}
          >
            Freeze Salary records
          </Button>
          {!permissionCheck.hasPermission &&
            permissionCheck.reasonDisplayString}
        </Fragment>
      )}
    </Box>
  );
}

async function freezeRecords(table, databaseTable, records) {
  const recordUpdates = [];
  for (const record of records) {
    let netSalary = parseInt(
      record.getCellValueAsString("netSalarytoBeProcessed")
    );
    let monthYear = record.getCellValueAsString("monthYear");
    let dataLastCopiedFor = record.getCellValueAsString(
      "Data Last Copied For?"
    );
    let statusText = record.getCellValueAsString("statusText");

    if (
      netSalary > 0 &&
      monthYear != dataLastCopiedFor &&
      statusText === "Paid"
    ) {
      await databaseTable.createRecordAsync({
        [NAME_FIELD_NAME]: record.getCellValueAsString(NAME_FIELD_NAME),
        [NETSALARY_FIELD_NAME]: record.getCellValueAsString(
          NETSALARY_FIELD_NAME
        ),
        [BRANCH_FIELD_NAME]: record.getCellValueAsString(BRANCH_FIELD_NAME),
        [ID_FIELD_NAME]: record.getCellValueAsString(ID_FIELD_NAME),
        [LOP_FIELD_NAME]: record.getCellValueAsString(LOP_FIELD_NAME),
        [GROSS_SALARY_FIELD_NAME]: record.getCellValueAsString(
          GROSS_SALARY_FIELD_NAME
        ),
        [TOTAL_DEDUCTION_FIELD_NAME]: record.getCellValueAsString(
          TOTAL_DEDUCTION_FIELD_NAME
        ),
        [BASIC_FIELD_NAME]: record.getCellValueAsString(BASIC_FIELD_NAME),
        [HRA_FIELD_NAME]: record.getCellValueAsString(HRA_FIELD_NAME),
        [STIPEND_FIELD_NAME]: record.getCellValueAsString(STIPEND_FIELD_NAME),
        [OTHER_EARNINGS_FIELD_NAME]: record.getCellValueAsString(
          OTHER_EARNINGS_FIELD_NAME
        ),

        [PROF_TAX_FIELD_NAME]: record.getCellValueAsString(PROF_TAX_FIELD_NAME),
        [PF_EMPLOYER_FIELD_NAME]: record.getCellValueAsString(
          PF_EMPLOYER_FIELD_NAME
        ),
        [PF_EMPLOYEE_FIELD_NAME]: record.getCellValueAsString(
          PF_EMPLOYEE_FIELD_NAME
        ),
        [SALARY_ADVANCE_FIELD_NAME]: record.getCellValueAsString(
          SALARY_ADVANCE_FIELD_NAME
        ),
        [MONTH_FIELD_NAME]: record.getCellValueAsString(MONTH_FIELD_NAME),
        [EMAIL_FIELD_NAME]: record.getCellValueAsString(EMAIL_FIELD_NAME)
      });

      recordUpdates.push({
        id: record.id,
        fields: {
          "Data Last Copied For?": monthYear
        }
      });
    }
  }
  return recordUpdates;
}

async function updateRecordsInBatchesAsync(table, recordUpdates) {
  let i = 0;
  while (i < recordUpdates.length) {
    const updateBatch = recordUpdates.slice(i, i + MAX_RECORDS_PER_UPDATE);
    // await is used to wait for the update to finish saving to Airtable servers before
    // continuing. This means we'll stay under the rate limit for writes.
    await table.updateRecordsAsync(updateBatch);
    i += MAX_RECORDS_PER_UPDATE;
  }
}

initializeBlock(() => <PayrollBlock />);
