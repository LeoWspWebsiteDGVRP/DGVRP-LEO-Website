import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { FileText, UserX } from "lucide-react";

export default function Selection() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "var(--law-primary)" }}>
      <div className="max-w-4xl mx-auto">
        <Card className="law-card shadow-2xl">
          <CardContent className="p-8">
            <h1 className="text-white text-2xl font-semibold text-center mb-8">
              Law Enforcement Form Selection
            </h1>

            <div className="flex flex-col items-center space-y-8 max-w-md mx-auto">
              {/* Citation Form Button */}
              <Link href="/citation" className="w-full">
                <Button className="law-accent-btn text-white font-semibold py-6 px-8 w-full text-lg">
                  <FileText className="h-6 w-6 mr-3" />
                  Citation Form
                </Button>
              </Link>

              {/* Arrest Form Button */}
              <Link href="/arrest" className="w-full">
                <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-6 px-8 w-full text-lg">
                  <UserX className="h-6 w-6 mr-3" />
                  Arrest Form
                </Button>
              </Link>
            </div>

            <div className="text-center mt-12">
              <p className="text-slate-300 text-sm">
                Select the appropriate form type to proceed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}