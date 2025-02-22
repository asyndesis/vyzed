"use client";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import startCase from "lodash/startCase";
import { Skeleton } from "@/components/ui/skeleton"; // Adjust the import path to your project structure
import { Fragment } from "react";

export const BreadCrumbs = ({ overrides = {}, isLoading = false }) => {
  const pathname = usePathname();
  const pathSegments = pathname.split("/").filter((segment) => segment);

  const breadcrumbs = pathSegments
    .map((segment, index) => {
      const defaultHref = "/" + pathSegments.slice(0, index + 1).join("/");
      const override = overrides[segment];
      const label = override?.label || startCase(segment);
      const href = override?.href || defaultHref;
      return { label, href };
    })
    .filter(Boolean); // Remove null entries

  if (isLoading) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <Skeleton className="h-4 min-w-[200px]" />
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((crumb, index) => (
          <Fragment key={index}>
            <BreadcrumbItem>
              {index === breadcrumbs.length - 1 ? (
                <BreadcrumbPage className="max-w-[200px] truncate">
                  {crumb.label}
                </BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink asChild>
                    <Link className="max-w-[200px] truncate" href={crumb.href}>
                      {crumb.label}
                    </Link>
                  </BreadcrumbLink>
                </>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
