export function suspenseWrapPromise<T>(promise: Promise<T>) {
	let status = "pending" as "pending" | "error" | "success";
	let result: T;

	const suspender = promise.then(
		response => {
			status = "success";
			result = response;
		},
		error => {
			status = "error";
			result = error;
		}
	);
	
	return {
	 	get() {
			switch (status) {
				case "pending": {
					throw suspender
				}
				case "error": {
					throw result
				}
				case "success": {
					return result
				}
			}
		}
	};
}