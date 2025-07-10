import type { FC, SVGProps } from "react";
import { ShieldCheck } from "lucide-react";

export const VouchlyLogo: FC<SVGProps<SVGSVGElement>> = (props) => {
    return <ShieldCheck {...props} />;
};
