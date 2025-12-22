import { Search, Plus, FileText, Users2Icon, Target, BarChart3 } from "lucide-react";

export function EmptyState({ 
  icon: Icon = FileText, 
  title, 
  description, 
  actionLabel, 
  onAction, 
  className = "" 
}) {
  return (
    <div className={`text-center py-12 w-[90%] md:w-[50%] border-dashed border-2 border-gray-200 mx-auto ${className}`}>
      <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
        <Icon className="h-12 w-12" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm bg-gold hover:bg-gold/20"
        >
          <Plus className="h-4 w-4 mr-2" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function EmptyDocuments({ onUpload }) {
  return (
    <EmptyState
      icon={FileText}
      title="No documents yet"
      description="Upload your first document to get started with document management."
      actionLabel="Upload Document"
      onAction={onUpload}
    />
  );
}

export function EmptyParticipants({ onInvite }) {
  return (
    <EmptyState
      icon={Users2Icon}
      title="No participants yet"
      description="Invite team members to collaborate on this deal room."
      actionLabel="Invite Participant"
      onAction={onInvite}
    />
  );
}

export function EmptyMilestones({ onCreate }) {
  return (
    <EmptyState
      icon={Target}
      title="No milestones set"
      description="Create milestones to track progress and important deadlines."
      actionLabel="Create Milestone"
      onAction={onCreate}
    />
  );
}

export function EmptyValuations({ onCreate }) {
  return (
    <EmptyState
      icon={BarChart3}
      title="No valuations yet"
      description="Run financial analysis and valuations to assess deal value."
      actionLabel="Create Valuation"
      onAction={onCreate}
    />
  );
}

export function EmptySearch({ searchTerm }) {
  return (
    <div className="text-center py-12">
      <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
      <p className="text-gray-500">
        No results match "{searchTerm}". Try adjusting your search or filters.
      </p>
    </div>
  );
}
