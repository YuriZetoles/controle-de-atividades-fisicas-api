import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

const treinadorIdSchema = z
	.string()
	.uuid({ message: "ID deve ser um UUID válido" })
	.openapi({
		description: "UUID do treinador",
		example: "550e8400-e29b-41d4-a716-446655440000",
	});

export { treinadorIdSchema };
