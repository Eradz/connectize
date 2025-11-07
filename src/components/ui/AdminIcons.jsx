// Admin Icon Mapping for consistent icon usage across admin panels
import {
  DashboardIcon,
  UsersIcon,
  UserIcon,
  CompanyIcon,
  BuildingIcon,
  ProductIcon,
  ServiceIcon,
  PostIcon,
  DocumentIcon,
  ChatIcon,
  MessageIcon,
  NotificationIcon,
  AnalyticsIcon,
  ChartIcon,
  SettingsIcon,
  MenuIcon,
  SearchIcon,
  FilterIcon,
  AddIcon,
  PlusIcon,
  EditIcon,
  DeleteIcon,
  CheckIcon,
  ErrorIcon,
  WarningIcon,
  InfoIcon,
  AlertIcon,
  VerifiedIcon,
  CloseIcon,
  RefreshIcon,
  DownloadIcon,
  ExportIcon,
  ViewIcon,
  HideIcon,
  CalendarIcon,
  EmailIcon,
  LockIcon,
  UnlockIcon,
  LinkIcon,
  StarIcon,
  HeartIcon,
  BookmarkIcon,
  ShareIcon,
  LoadingIcon,
  SortIcon,
  DotsIcon,
  PaperclipIcon,
  MapIcon,
  GlobeIcon,
  ShieldIcon,
  DatabaseIcon,
  ServerIcon,
  CloudIcon,
  CpuIcon,
  ActivityIcon,
  PulseIcon,
  ZapIcon,
  FlameIcon,
  ThumbsUpIcon,
  MegaphoneIcon,
  ListIcon,
  GridIcon,
  MoneyIcon,
  TrendingIcon,
  SunIcon,
  MoonIcon,
  CommandIcon,
  KeyboardIcon,
  ArrowIcon,
  ChevronIcon,
} from './ModernIcon';

// Icon mapping for common admin functions
export const AdminIcons = {
  // Navigation
  dashboard: DashboardIcon,
  users: UsersIcon,
  user: UserIcon,
  companies: CompanyIcon,
  company: CompanyIcon,
  building: BuildingIcon,
  products: ProductIcon,
  product: ProductIcon,
  services: ServiceIcon,
  service: ServiceIcon,
  posts: PostIcon,
  post: PostIcon,
  documents: DocumentIcon,
  document: DocumentIcon,
  messages: ChatIcon,
  message: MessageIcon,
  notifications: NotificationIcon,
  notification: NotificationIcon,
  analytics: AnalyticsIcon,
  chart: ChartIcon,
  settings: SettingsIcon,
  
  // Interface
  menu: MenuIcon,
  search: SearchIcon,
  filter: FilterIcon,
  close: CloseIcon,
  
  // Actions
  add: AddIcon,
  plus: PlusIcon,
  edit: EditIcon,
  delete: DeleteIcon,
  view: ViewIcon,
  hide: HideIcon,
  refresh: RefreshIcon,
  download: DownloadIcon,
  export: ExportIcon,
  share: ShareIcon,
  
  // Status
  check: CheckIcon,
  success: CheckIcon,
  error: ErrorIcon,
  warning: WarningIcon,
  info: InfoIcon,
  alert: AlertIcon,
  verified: VerifiedIcon,
  loading: LoadingIcon,
  
  // Data & Sorting
  sort: SortIcon,
  dots: DotsIcon,
  list: ListIcon,
  grid: GridIcon,
  
  // Content
  calendar: CalendarIcon,
  email: EmailIcon,
  star: StarIcon,
  heart: HeartIcon,
  bookmark: BookmarkIcon,
  paperclip: PaperclipIcon,
  
  // Security
  lock: LockIcon,
  unlock: UnlockIcon,
  shield: ShieldIcon,
  
  // System
  link: LinkIcon,
  map: MapIcon,
  globe: GlobeIcon,
  database: DatabaseIcon,
  server: ServerIcon,
  cloud: CloudIcon,
  cpu: CpuIcon,
  activity: ActivityIcon,
  pulse: PulseIcon,
  zap: ZapIcon,
  flame: FlameIcon,
  
  // Social
  thumbsUp: ThumbsUpIcon,
  megaphone: MegaphoneIcon,
  
  // Financial
  money: MoneyIcon,
  trending: TrendingIcon,
  
  // Theme
  sun: SunIcon,
  moon: MoonIcon,
  
  // Input
  command: CommandIcon,
  keyboard: KeyboardIcon,
  
  // Navigation helpers
  arrow: ArrowIcon,
  chevron: ChevronIcon,
};

// Helper function to get admin icon
export const getAdminIcon = (iconName, props = {}) => {
  const IconComponent = AdminIcons[iconName];
  if (!IconComponent) {
    console.warn(`Admin icon "${iconName}" not found`);
    return null;
  }
  return IconComponent;
};

export default AdminIcons;
