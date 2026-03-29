import Card, { CardContent, CardFooter } from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';

export default function ProductCardSkeleton() {
  return (
    <Card>
      <Skeleton className="h-44" variant="cyberpunk" />
      <CardContent>
        <Skeleton className="h-3 w-28 mt-4" />
        <Skeleton className="h-4 w-full mt-3" />
        <Skeleton className="h-6 w-24 mt-4" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}
