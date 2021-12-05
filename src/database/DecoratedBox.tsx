import { FC } from "react";
import classes from "./DecoratedBox.module.css"

export interface DecoratedBoxProps {
	label?: string
	direction?: "column" | "row"
}
export const DecoratedBox: FC<DecoratedBoxProps> = ({children, label, direction}) => {

	const style: React.CSSProperties = {
		display: direction !== undefined ? "flex" : undefined,
		flexDirection: direction !== undefined ? direction : undefined
	}

	return <div style={style} className={classes.box}>
		<div className={classes.box_label}>{label}</div>
		{children}
	</div>
}