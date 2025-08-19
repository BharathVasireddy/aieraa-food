export default function UnauthorizedPage() {
	return (
		<div className="flex min-h-[60vh] items-center justify-center p-6 text-center">
			<div>
				<h1 className="text-2xl font-semibold">Access denied</h1>
				<p className="mt-2 text-muted-foreground">You do not have permission to view this page.</p>
			</div>
		</div>
	);
}


