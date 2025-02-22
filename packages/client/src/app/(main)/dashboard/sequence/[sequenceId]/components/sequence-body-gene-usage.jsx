import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const SequenceBodyGeneUsage = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-gray-600">Gene Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-evenly gap-6">
          <div className="flex flex-col items-center">
            <div>IGHV3-48-03</div>
            <div className="text-muted-foreground text-sm">V Gene</div>
          </div>
          <div className="flex flex-col items-center">
            <div>IGHD5-24-01</div>
            <div className="text-muted-foreground text-sm">J Gene</div>
          </div>
          <div className="flex flex-col items-center">
            <div>IGHV3-48-03</div>
            <div className="text-muted-foreground text-sm">D Gene</div>
          </div>
        </div>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
};
