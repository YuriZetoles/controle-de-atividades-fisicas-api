ALTER TABLE "treino_exercicio" ALTER COLUMN "repeticoes" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "treino_exercicio" ADD COLUMN "duracao_sugerida_segundos" integer;--> statement-breakpoint
ALTER TABLE "treino_exercicio" ADD COLUMN "distancia_sugerida_metros" integer;