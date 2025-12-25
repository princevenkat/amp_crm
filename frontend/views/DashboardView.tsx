import React, { useContext, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { DataContext } from '../contexts/DataContext';
import { TaskStatus, CaseStatus } from '../types';

const StatCard: React.FC<{ title: string; value: string; description: string, dark?: boolean }> = ({ title, value, description, dark = false }) => (
    <Card className={dark ? 'bg-primary text-white' : ''}>
        <CardHeader className={`text-sm font-medium text-text-secondary`}>{title}</CardHeader>
        <CardContent>
            <p className={`text-3xl font-bold text-text-primary`}>{value}</p>
            <p className={`text-sm text-text-secondary`}>{description}</p>
        </CardContent>
    </Card>
);

const ChartContainer: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Card>
        <CardHeader>{title}</CardHeader>
        <CardContent>
            <div style={{ width: '100%', height: 300 }}>
                {children}
            </div>
        </CardContent>
    </Card>
);

const COLORS = ['#002D62', '#D4AF37', '#6C757D'];

export const DashboardView: React.FC = () => {
    const { clients, tasks, ledger } = useContext(DataContext);

    const revenueData = useMemo(() => {
        const monthlyRevenue: { [key: string]: number } = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        // ledger.forEach(entry => {
        //     if (entry.type !== 'Expense') {
        //         const date = new Date(entry.date);
        //         const month = date.getMonth();
        //         const year = date.getFullYear();
        //         const key = `${year}-${String(month).padStart(2, '0')}`;
        //         if (!monthlyRevenue[key]) monthlyRevenue[key] = 0;
        //         monthlyRevenue[key] += entry.amount;
        //     }
        // });
        ledger.forEach(entry => {
            if (entry.type !== 'Expense') {
                const date = new Date(entry.date);
                const month = date.getMonth();
                const year = date.getFullYear();
                const key = `${year}-${String(month).padStart(2, '0')}`;

                if (!monthlyRevenue[key]) monthlyRevenue[key] = 0;
                monthlyRevenue[key] += Number(entry.amount); // ✅ convert to number
            }
        });




        // ledger.forEach(entry => {
        //     if (entry.type !== 'Expense' && entry.pay_status === 'Paid') {
        //         const date = new Date(entry.date);
        //         const month = date.getMonth();
        //         const year = date.getFullYear();
        //         const key = `${year}-${String(month).padStart(2, '0')}`;

        //         if (!monthlyRevenue[key]) monthlyRevenue[key] = 0;
        //         monthlyRevenue[key] += Number(entry.amount); // ensure number
        //     }
        // });
        // console.log("Monthly Revenue (Paid Only):", monthlyRevenue);


        return Object.entries(monthlyRevenue)
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
            .map(([key, revenue]) => {
                const [year, monthIndex] = key.split('-');
                return { name: `${monthNames[parseInt(monthIndex, 10)]} '${year.slice(2)}`, Revenue: revenue };
            });
    }, [ledger]);

    const leadPipelineData = useMemo(() => {
        const leads = clients.filter(c => c.status === 'Lead');
        const stages: CaseStatus[] = ['Initial Enquiry', 'AIP', 'FMA Submitted', 'Offered'];
        const stageCounts = stages.map(stage => ({
            name: stage,
            Leads: leads.filter(l => l.caseStatus === stage).length,
        }));
        return stageCounts;
    }, [clients]);

    const taskStatusData = useMemo(() => {
        const statuses = Object.values(TaskStatus);
        return statuses.map(status => ({
            name: status,
            value: tasks.filter(t => t.status === status).length,
        }));
    }, [tasks]);

    const newClientData = useMemo(() => {
        const monthlyNewClients: { [key: string]: number } = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        clients.forEach(client => {
            const date = new Date(client.createdDate);
            const month = date.getMonth();
            const year = date.getFullYear();
            const key = `${year}-${String(month).padStart(2, '0')}`;
            if (!monthlyNewClients[key]) monthlyNewClients[key] = 0;
            monthlyNewClients[key]++;
        });

        return Object.entries(monthlyNewClients)
            .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
            .map(([key, count]) => {
                const [year, monthIndex] = key.split('-');
                return { name: `${monthNames[parseInt(monthIndex, 10)]} '${year.slice(2)}`, "New Clients": count };
            });

    }, [clients]);

    // const totalRevenue = ledger.filter(e => e.type !== 'Expense').reduce((acc, curr) => acc + curr.amount, 0);

    // const totalRevenue = ledger
    //     .filter(e => e.type !== 'Expense')
    //     .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const totalRevenue = ledger
        .filter(e => e.type !== 'Expense' && e.pay_status === 'Paid')
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const clientsWonCount = clients.filter(c => c.caseStatus === 'Completed').length;
    const activeClientsCount = clients.filter(c => c.status === 'Active').length;
    const activeLeadsCount = clients.filter(
        c => c.status === 'Pipeline' || c.status === 'Lead'
    ).length;

    return (
        <div className="p-4 sm:p-8 bg-background min-h-full">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold">Dashboard</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Revenue" value={`£${totalRevenue.toLocaleString()}`} description="Gross income this year" />
                <StatCard title="Active Clients" value={activeClientsCount.toString()} description="In clients" />
                <StatCard title="Active Leads" value={activeLeadsCount.toString()} description="In pipeline" />
                <StatCard title="Clients Won" value={clientsWonCount.toString()} description="Completed this year" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartContainer title="Monthly Revenue">
                    <ResponsiveContainer>
                        <LineChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }} />
                            <Legend />
                            <Line type="monotone" dataKey="Revenue" stroke="#002D62" strokeWidth={2} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <ChartContainer title="Lead Pipeline">
                    <ResponsiveContainer>
                        <BarChart data={leadPipelineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }} />
                            <Legend />
                            <Bar dataKey="Leads" fill="#004080" />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <ChartContainer title="Task Status">
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={taskStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {taskStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }} />
                            <Legend
                                layout="vertical"
                                verticalAlign="middle"
                                align="right"
                                iconSize={10}
                                wrapperStyle={{ paddingRight: 16, fontSize: '14px', lineHeight: '30px', }}
                            />

                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>

                <ChartContainer title="New Client Growth">
                    <ResponsiveContainer>
                        <LineChart data={newClientData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                            <YAxis stroke="#6b7280" fontSize={12} allowDecimals={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb' }} />
                            <Legend />
                            <Line type="monotone" dataKey="New Clients" stroke="#D4AF37" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </div>
        </div>
    );
};