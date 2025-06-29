"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const availabilitySchema = z.object({
  monday: z.array(z.string()),
  tuesday: z.array(z.string()),
  wednesday: z.array(z.string()),
  thursday: z.array(z.string()),
  friday: z.array(z.string()),
  saturday: z.array(z.string()),
  sunday: z.array(z.string()),
});

const formSchema = z.object({
  email: z.string().email().refine(email => email.endsWith('.ac.uk'), {
    message: "Must be a valid UK university email (.ac.uk)"
  }),
  password: z.string().min(8, "Password must be at least 8 characters."),
  fullName: z.string().min(2, "Full name is required."),
  course: z.string().min(2, "Course name is required."),
  yearOfStudy: z.string().min(1, "Please select your year of study."),
  studyAtmosphere: z.string().min(1, "Please select your preferred study atmosphere."),
  cameraPreference: z.string().min(1, "Please select your camera preference."),
  weeklyGoal: z.number().min(1).max(20),
  availability: availabilitySchema,
  bio: z.string().max(150, "Bio must be 150 characters or less.").optional(),
});

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const times = ["morning", "afternoon", "evening"];
const timeEmojis = ["🌅", "☀️", "🌙"];

export function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      course: "",
      yearOfStudy: "",
      studyAtmosphere: "",
      cameraPreference: "",
      weeklyGoal: 3,
      availability: {
        monday: [], tuesday: [], wednesday: [], thursday: [],
        friday: [], saturday: [], sunday: [],
      },
      bio: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Signup submitted:", values);
    toast({
      title: "Account Created!",
      description: "Welcome to Vouchly! Redirecting to your dashboard.",
    });
    router.push("/dashboard");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Create Your Account</CardTitle>
        <CardDescription>Join a community of motivated students.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="fullName" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="email" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>University Email</FormLabel>
                  <FormControl><Input placeholder="j.doe23@cam.ac.uk" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="password" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="course" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Course</FormLabel>
                  <FormControl><Input placeholder="BSc Computer Science" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="yearOfStudy" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Year of Study</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select year" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Year 1">Year 1</SelectItem>
                      <SelectItem value="Year 2">Year 2</SelectItem>
                      <SelectItem value="Year 3">Year 3</SelectItem>
                      <SelectItem value="Year 4+">Year 4+</SelectItem>
                      <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="studyAtmosphere" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Study Atmosphere</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select atmosphere" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Silent & Independent">Silent & Independent</SelectItem>
                      <SelectItem value="Quietly Co-working">Quietly Co-working</SelectItem>
                      <SelectItem value="Motivational & Social">Motivational & Social</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="cameraPreference" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Camera Preference</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select preference" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="Camera always on">Camera always on</SelectItem>
                      <SelectItem value="Camera on for check-ins">Camera on for check-ins</SelectItem>
                      <SelectItem value="Camera always off">Camera always off</SelectItem>
                      <SelectItem value="Flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="weeklyGoal" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Weekly Session Goal</FormLabel>
                   <FormControl><Input type="number" min={1} max={20} {...field} onChange={e => field.onChange(parseInt(e.target.value))} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div>
                <FormLabel>Your Availability</FormLabel>
                <CardDescription>Select when you're generally free to study.</CardDescription>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2 p-2 border rounded-md mt-2">
                    {days.map((day) => (
                        <div key={day} className="flex flex-col items-center gap-1">
                            <p className="font-bold text-sm">{day.substring(0, 3)}</p>
                            {times.map((time, index) => (
                                <FormField
                                    key={`${day}-${time}`}
                                    control={form.control}
                                    name={`availability.${day.toLowerCase() as keyof z.infer<typeof availabilitySchema>}`}
                                    render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(time)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                            ? field.onChange([...(field.value || []), time])
                                                            : field.onChange(field.value?.filter((value) => value !== time));
                                                    }}
                                                />
                                            </FormControl>
                                            <FormLabel className="text-sm font-normal">{timeEmojis[index]}</FormLabel>
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <FormField name="bio" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Bio (Optional)</FormLabel>
                <FormControl><Textarea placeholder="Tell potential partners about your study goals..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Button type="submit" className="w-full font-headline">Create Account</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
