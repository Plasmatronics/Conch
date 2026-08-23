import { Pool } from "pg";
import {
	membersIdColumnName,
	membersSchema,
	memberQuerySchema,
	membersTableName,
	membersUpdateSchema,
} from "../../schemas";
import { ControllerFactory } from "../controllerFactory";
import { CRUDFactory } from "../../queries";

export const membersControllers = (dbPool: Pool) => {
	const crudFactory = new CRUDFactory({
		tableName: membersTableName,
		idColumnName: membersIdColumnName,
	});

	const memberControllerFactory = new ControllerFactory({
		dbPool,
		crudFactory,
		createSchema: memberQuerySchema,
		updateSchema: membersUpdateSchema,
		tableSchema: membersSchema,
		conchScoped: true,
		idParamName: "memberId",
	});

	return memberControllerFactory.createControllers();
};
