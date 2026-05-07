CREATE TYPE "public"."tipo_exercicio" AS ENUM('REPETICAO', 'TEMPO', 'DISTANCIA');--> statement-breakpoint
ALTER TABLE "exercicio" ADD COLUMN "tipo_exercicio" "tipo_exercicio" DEFAULT 'REPETICAO' NOT NULL;
