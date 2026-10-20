import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, CompetitionConfig } from "../generated/prisma";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export const FIRST_NAMES = [
  "João",
  "Pedro",
  "Miguel",
  "Diogo",
  "Tiago",
  "André",
  "Bruno",
  "Rui",
  "Daniel",
  "Ricardo",
  "Luís",
  "Gonçalo",
  "Tomás",
  "Afonso",
  "Rodrigo",
  "David",
  "José",
  "Filipe",
  "Nuno",
  "Marco",
  "Hugo",
  "António",
  "Francisco",
  "Simão",
  "Vasco",
  "Leandro",
  "Renato",
  "Rafael",
  "Eduardo",
  "Sérgio",
];

export const LAST_NAMES = [
  "Silva",
  "Santos",
  "Ferreira",
  "Pereira",
  "Costa",
  "Oliveira",
  "Rodrigues",
  "Martins",
  "Jesus",
  "Sousa",
  "Fernandes",
  "Gonçalves",
  "Lopes",
  "Marques",
  "Alves",
  "Ribeiro",
  "Pinto",
  "Carvalho",
  "Teixeira",
  "Correia",
  "Mendes",
  "Rocha",
  "Monteiro",
  "Neves",
  "Cardoso",
  "Coelho",
  "Moura",
  "Vieira",
  "Barbosa",
  "Moreira",
];

const TEAM_NAMES = [
  "Amarense",
  "Núcleo SCP Batalha",
  "Rebolaria",
  "Quinta do Sobrado",
  "UDBatalha",
  "São Mamede",
  "Reguendo de Fetal",
  "Santo Tirso",
  "Vila Nova",
  "Vila Meã",
];

async function main() {
  console.log("🌱 Seeding database...");

  // Limpeza
  await prisma.matchEvent.deleteMany();
  await prisma.match.deleteMany();
  await prisma.player.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.team.deleteMany();
  await prisma.competition.deleteMany();

  // Competições
  const competitions = [
    {
      name: "2026 Masculinos",
      color: "#0969da",
      startDate: new Date(),
      config: CompetitionConfig.LEAGUE,
      qualified: 8,
      opponents: 4,
    },
    {
      name: "2026 Femininos",
      color: "#d92f2f",
      startDate: new Date(),
      config: CompetitionConfig.LEAGUE,
      qualified: 2,
      opponents: 3,
    },
    {
      name: "2026 Masters",
      color: "#2da44e",
      startDate: new Date(),
      config: CompetitionConfig.LEAGUE,
      qualified: 4,
      opponents: 5,
    },
  ];

  for (const competitionData of competitions) {
    const competition = await prisma.competition.create({
      data: competitionData,
    });

    for (const teamName of TEAM_NAMES) {
      const team = await prisma.team.create({
        data: {
          name: teamName,
          competitionId: competition.id,
        },
      });

      await prisma.staff.createMany({
        data: [
          { name: randomName(), teamId: team.id },
          { name: randomName(), teamId: team.id },
        ],
      });

      await prisma.player.createMany({
        data: Array.from({ length: 12 }, (_, index) => ({
          name: randomName(),
          number: index + 1,
          teamId: team.id,
        })),
      });
    }
  }

  console.log("✅ Seed completed");
}

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomName() {
  return `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
