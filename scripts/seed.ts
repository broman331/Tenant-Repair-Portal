/**
 * Seed script to populate the API with sample tickets and workers.
 * Run with: npx tsx scripts/seed.ts
 */

const API = 'http://localhost:4000';

interface WorkerResponse {
    worker: { id: string; name: string; specialization: string };
}

interface TicketResponse {
    ticketId: string;
}

async function post<T>(url: string, body: Record<string, string>): Promise<T> {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return res.json() as Promise<T>;
}

async function patch(url: string, body: Record<string, string>): Promise<void> {
    await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
}

async function main() {
    console.log('🌱 Seeding workers...');
    const workers = await Promise.all([
        post<WorkerResponse>(`${API}/api/workers`, { name: 'Pieter van den Berg', specialization: 'Plumber' }),
        post<WorkerResponse>(`${API}/api/workers`, { name: 'Sophie de Groot', specialization: 'Electrician' }),
        post<WorkerResponse>(`${API}/api/workers`, { name: 'Lars Bakker', specialization: 'HVAC Technician' }),
        post<WorkerResponse>(`${API}/api/workers`, { name: 'Emma Visser', specialization: 'Carpenter' }),
        post<WorkerResponse>(`${API}/api/workers`, { name: 'Daan Jansen', specialization: 'General' }),
    ]);
    console.log(`   ✅ ${workers.length} workers created`);

    console.log('🌱 Seeding tickets...');
    const tickets = await Promise.all([
        post<TicketResponse>(`${API}/api/repair-requests`, { name: 'Jan de Vries', address: 'Keizersgracht 123, 1015 CJ Amsterdam', issueType: 'Plumbing', priority: 'Urgent', description: 'Major water leak under the kitchen sink. Water is spreading to the hallway floor.' }),
        post<TicketResponse>(`${API}/api/repair-requests`, { name: 'Maria Jansen', address: 'Prinsengracht 456, 1016 HK Amsterdam', issueType: 'Electrical', priority: 'High', description: 'Power outages in the living room circuit. Lights flicker before going off entirely.' }),
        post<TicketResponse>(`${API}/api/repair-requests`, { name: 'Thomas Bakker', address: 'Herengracht 78, 1015 BN Amsterdam', issueType: 'Heating', priority: 'High', description: 'Central heating radiator in the bedroom not working. Temperature drops below 15°C at night.' }),
        post<TicketResponse>(`${API}/api/repair-requests`, { name: 'Anna van Dijk', address: 'Singel 200, 1012 SG Amsterdam', issueType: 'Structural', priority: 'Medium', description: 'Crack in the bathroom wall near the shower. Appears to be getting wider.' }),
        post<TicketResponse>(`${API}/api/repair-requests`, { name: 'Bram Vermeer', address: 'Damrak 15, 1012 LG Amsterdam', issueType: 'Plumbing', priority: 'Low', description: 'Slow draining bathtub. Water takes about 10 minutes to fully drain.' }),
        post<TicketResponse>(`${API}/api/repair-requests`, { name: 'Lisa Mulder', address: 'Rokin 88, 1012 KZ Amsterdam', issueType: 'Other', priority: 'Medium', description: 'Front door lock is stiff and difficult to turn. Key gets stuck intermittently.' }),
        post<TicketResponse>(`${API}/api/repair-requests`, { name: 'Sander Kok', address: 'Vijzelstraat 32, 1017 HM Amsterdam', issueType: 'Electrical', priority: 'Urgent', description: 'Sparks from a wall outlet in the kitchen. Burning smell noticed. Outlet disabled.' }),
        post<TicketResponse>(`${API}/api/repair-requests`, { name: 'Femke de Boer', address: 'Leidseplein 5, 1017 PR Amsterdam', issueType: 'Heating', priority: 'Low', description: 'Thermostat display flickering and sometimes shows incorrect temperature readings.' }),
    ]);
    console.log(`   ✅ ${tickets.length} tickets created`);

    console.log('🌱 Assigning workers to urgent/high tickets...');
    await patch(`${API}/api/repair-requests/${tickets[0]!.ticketId}/assign`, { workerId: workers[0]!.worker.id });
    await patch(`${API}/api/repair-requests/${tickets[1]!.ticketId}/assign`, { workerId: workers[1]!.worker.id });
    await patch(`${API}/api/repair-requests/${tickets[2]!.ticketId}/assign`, { workerId: workers[2]!.worker.id });
    await patch(`${API}/api/repair-requests/${tickets[6]!.ticketId}/assign`, { workerId: workers[1]!.worker.id });
    console.log('   ✅ 4 assignments made');

    console.log('\n🎉 Seed complete! Open http://localhost:3000/tickets to see the data.');
}

main().catch(console.error);
