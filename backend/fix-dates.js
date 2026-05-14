const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  try {
    const events = await prisma.event.findMany();
    console.log(`Found ${events.length} events. Starting update...`);

    for (const e of events) {
      const newDate = new Date(e.eventDate);
      newDate.setFullYear(newDate.getFullYear() + 2);

      const newEnd = e.endDate ? new Date(e.endDate) : null;
      if (newEnd) newEnd.setFullYear(newEnd.getFullYear() + 2);

      await prisma.event.update({
        where: { id: e.id },
        data: { eventDate: newDate, endDate: newEnd }
      });
      console.log(`Fixed: ${e.title} -> ${newDate.toDateString()}`);
    }
    console.log('All events updated successfully!');
  } catch (error) {
    console.error('Error updating events:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fix();