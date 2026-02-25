/**
 * Shared TypeScript types for the video streaming platform
 */
export var UserRole;
(function (UserRole) {
    UserRole["USER"] = "user";
    UserRole["MODERATOR"] = "moderator";
    UserRole["ADMIN"] = "admin";
})(UserRole || (UserRole = {}));
// ============= Video Types =============
export var VideoStatus;
(function (VideoStatus) {
    VideoStatus["UPLOADED"] = "uploaded";
    VideoStatus["PROCESSING"] = "processing";
    VideoStatus["READY"] = "ready";
    VideoStatus["FAILED"] = "failed";
    VideoStatus["ARCHIVED"] = "archived";
})(VideoStatus || (VideoStatus = {}));
export var VideoResolution;
(function (VideoResolution) {
    VideoResolution["360p"] = "360p";
    VideoResolution["480p"] = "480p";
    VideoResolution["720p"] = "720p";
    VideoResolution["1080p"] = "1080p";
})(VideoResolution || (VideoResolution = {}));
// ============= Interaction Types =============
export var InteractionType;
(function (InteractionType) {
    InteractionType["LIKE"] = "like";
    InteractionType["DISLIKE"] = "dislike";
})(InteractionType || (InteractionType = {}));
// ============= Event Tracking Types =============
export var EventType;
(function (EventType) {
    EventType["WATCH"] = "watch";
    EventType["LIKE"] = "like";
    EventType["DISLIKE"] = "dislike";
    EventType["COMMENT"] = "comment";
    EventType["SKIP"] = "skip";
    EventType["SEARCH"] = "search";
    EventType["SHARE"] = "share";
    EventType["REPORT"] = "report";
})(EventType || (EventType = {}));
//# sourceMappingURL=index.js.map