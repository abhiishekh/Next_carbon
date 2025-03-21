"use client"

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { offsetAgainstProject } from "@/utils/ethersUtils";
import { generateRetirementCertificate } from "@/utils/pdfGenerator";
import { format } from "date-fns";

// Define the project type
interface Project {
    id: string;
    name: string;
    availableCredits: number;
}

// Sample projects data
const projects: Project[] = [
    {
        id: "1",
        name: "4×50 MW Dayingjiang-3 Hydropower Project",
        availableCredits: 1000
    },
    {
        id: "2",
        name: "Sichuan Province Biogas Development Programme",
        availableCredits: 500
    },
    {
        id: "3",
        name: "100 MW Wind Power Project in Karnataka",
        availableCredits: 750
    },
    {
        id: "4",
        name: "Forest Conservation Project in Amazon",
        availableCredits: 1200
    },
    {
        id: "5",
        name: "Solar Power Plant in Rajasthan Desert",
        availableCredits: 900
    }
];

// Define the purchase type
interface Purchase {
    projectId: string;
    projectName: string;
    credits: number;
    description: string;
    address: string;
    trxHash: string;
    date: Date;
}

// Form schema
const formSchema = z.object({
    projectId: z.string({ required_error: "Please select a project." }),
    credits: z.coerce.number({
        required_error: "Please enter the number of credits.",
        invalid_type_error: "Credits must be a number."
    }).positive("Credits must be positive."),
    description: z.string().min(5, "Description must be at least 5 characters."),
    address: z.string().min(42, "Address is not valid.").max(42, "Address is not valid."),
});

export default function CreditPurchasePage() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // @ts-ignore
    const [txHash, setTxHash] = useState<string | null>(null);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { description: "" },
    });
    const [loading, setLoading] = useState(false);

    const selectedProjectId = form.watch("projectId");
    const selectedProject = projects.find((p) => p.id === selectedProjectId);

    const validateCredits = (value: number) => {
        if (!selectedProject) return true;
        return value <= selectedProject.availableCredits || `Credits must be less than or equal to ${selectedProject.availableCredits}`;
    };

    // Form submission handler
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const today = format(new Date(), "dd MMM yyyy").toString();
        if (!selectedProject) {
            toast("Please select a project.");
            return;
        }

        if (values.credits > selectedProject.availableCredits) {
            toast("Insufficient credits available.");
            return;
        }

        try {
            console.log("Statred contractFun")
            setLoading(true);
            const hash = await offsetAgainstProject(values.credits, "0x74C744D91650Ce734B3D8b00eCC98d8B8043edE3", values.address, selectedProject.name);
            setTxHash(hash);
            console.log("hash", hash)
            const purchase: Purchase = {
                projectId: values.projectId,
                projectName: selectedProject.name,
                credits: values.credits,
                address: values.address,
                description: values.description,
                trxHash: hash,
                date: new Date(),
            };

            setPurchases([purchase, ...purchases]);
            // generatePDF(purchase);
            generateRetirementCertificate({
                retiredOn: today,
                tonnes: (values.credits / 1).toString(),
                beneficiaryAddress: values.address,
                project: selectedProject.name,
                transactionHash: hash,
                description: values.description
            })
            form.reset();
            setLoading(false);
            toast("Purchase Successful");
        } catch {
            toast("Transaction failed");
        }
    };

    return (
        <div className="container mx-auto py-10 max-w-[90%]">
            <Card className="mb-8 w-full">
                <CardHeader>
                    <CardTitle>Retire Credits</CardTitle>
                    <CardDescription>Select a project and specify the number of credits you want to purchase.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="projectId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Project</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a project" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {projects.map((project) => (
                                                        <SelectItem key={project.id} value={project.id}>
                                                            {project.name} ({project.availableCredits} credits available)
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormDescription className="text-xs">
                                                Select the project you want to Retire credits for.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="credits"
                                    rules={{
                                        validate: validateCredits,
                                    }}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Number of Credits</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                {selectedProject
                                                    ? `Enter a number less than or equal to ${selectedProject.availableCredits}.`
                                                    : "Select a project first."}
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Address</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} rows={3} />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            Provide a brief description for this purchase.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className={`w-full ${loading ? "bg-primary/70" : "bg-primary"}`} disabled={loading}>
                                Purchase Credits
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
            {/* <Button type="submit" onClick={handleGenerate} className="w-full bg-primary">
                Purchase Credits
            </Button> */}

            {purchases.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Purchases</CardTitle>
                        <CardDescription>Your recent credit purchases are listed below.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {purchases.map((purchase, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div className="font-medium">Project:</div>
                                        <div className="break-words">{purchase.projectName}</div>

                                        <div className="font-medium">Credits:</div>
                                        <div className="break-words">{purchase.credits}</div>

                                        <div className="font-medium">Address:</div>
                                        <div className="break-words">{purchase.address}</div>

                                        <div className="font-medium">Transaction Hash:</div>
                                        <div className="break-words hover:text-blue-500">
                                            <a href={`https://amoy.polygonscan.com/tx/${purchase.trxHash}`} target="_blank" rel="noopener noreferrer">
                                                {purchase.trxHash}
                                            </a>
                                        </div>

                                        <div className="font-medium">Description:</div>
                                        <div className="break-words">{purchase.description}</div>

                                        <div className="font-medium">Date:</div>
                                        <div className="break-words">{purchase.date.toLocaleString()}</div>
                                    </div>
                                    <Button variant="outline" size="sm" className="mt-2" onClick={() => generateRetirementCertificate({
                                        retiredOn: format(purchase.date, "dd MMM yyyy").toString(),
                                        tonnes: (purchase.credits / 1).toString(),
                                        beneficiaryAddress: purchase.address,
                                        project: purchase.projectName,
                                        transactionHash: purchase.trxHash,
                                        description: purchase.description
                                    })}>
                                        Download Receipt
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

