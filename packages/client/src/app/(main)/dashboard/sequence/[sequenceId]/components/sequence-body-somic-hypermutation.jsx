"use client";
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTabs } from "@/components/use-tabs";

// Define constants or an enumeration for tab keys
const TAB_KEYS = {
  V_GENE: "v-gene",
  V_AND_J_GENE: "v-and-j-gene",
};

export function SequenceBodySomicHypermutation() {
  const tabs = [
    { key: TAB_KEYS.V_GENE, label: "V Gene" },
    { key: TAB_KEYS.V_AND_J_GENE, label: "V and J Gene" },
  ];
  const { setActiveTab } = useTabs("somic", tabs, TAB_KEYS.V_AND_J_GENE);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-gray-600">
          Somic Hypermutation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={TAB_KEYS.V_GENE} onValueChange={setActiveTab}>
          <TabsList>
            {tabs.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key} className="flex-1">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.key} value={tab.key}>
              <div>{tab.label} Content</div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
