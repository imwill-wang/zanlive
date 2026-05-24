/*
MySQL Backup
Database: bogo_db
Backup Time: 2026-05-24 14:31:40
*/

SET FOREIGN_KEY_CHECKS=0;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_blackword`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_config`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_department`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_department_member`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_emoticon`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_emoticon_item`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_emoticon_record`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_friend_0`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_friend_1`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_friend_2`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_friend_3`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_friend_4`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_friend_5`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_friend_6`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_friend_7`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_friend_8`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_friend_9`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_group`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_group_member`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_group_notice`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_group_robot`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_manager`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_meeting`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_app`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_chat`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_event`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_group`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_index_0`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_index_1`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_index_2`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_index_3`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_index_4`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_index_5`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_index_6`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_index_7`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_index_8`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_index_9`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_patch_0`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_patch_1`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_patch_2`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_patch_3`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_patch_4`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_patch_5`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_patch_6`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_patch_7`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_patch_8`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_patch_9`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_message_system`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_micro_app`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_micro_server`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_micro_server_menu`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_moment`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_moment_comment`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_moment_rule`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_note`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_organization`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_session`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_silent_notification`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_subscriber`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_user`;
DROP TABLE IF EXISTS `bogo_db`.`t_bogo_validation_code`;
DROP TABLE IF EXISTS `bogo_db`.`t_live_anchor`;
DROP TABLE IF EXISTS `bogo_db`.`t_live_anchor_config`;
DROP TABLE IF EXISTS `bogo_db`.`t_live_anchor_follower`;
DROP TABLE IF EXISTS `bogo_db`.`t_live_anchor_gallery`;
DROP TABLE IF EXISTS `bogo_db`.`t_live_chat_session`;
DROP TABLE IF EXISTS `bogo_db`.`t_live_customer_service_account`;
DROP TABLE IF EXISTS `bogo_db`.`t_live_friend_apply`;
DROP TABLE IF EXISTS `bogo_db`.`t_live_gift`;
DROP TABLE IF EXISTS `bogo_db`.`t_live_gift_record`;
DROP TABLE IF EXISTS `bogo_db`.`t_live_invite_code`;
DROP TABLE IF EXISTS `bogo_db`.`t_live_message`;
DROP TABLE IF EXISTS `bogo_db`.`t_live_reward_record`;
DROP TABLE IF EXISTS `bogo_db`.`t_live_room`;
DROP TABLE IF EXISTS `bogo_db`.`t_live_room_enter_record`;
DROP TABLE IF EXISTS `bogo_db`.`t_live_wallet`;
DROP TABLE IF EXISTS `bogo_db`.`t_live_wallet_record`;
CREATE TABLE `t_bogo_blackword` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `content` varchar(32) NOT NULL COMMENT '敏感词内容',
  `description` varchar(200) DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL COMMENT '添加时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='敏感词配置';
CREATE TABLE `t_bogo_config` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `domain` varchar(32) NOT NULL,
  `name` varchar(32) NOT NULL,
  `value` text NOT NULL,
  `description` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='系统参数配置表';
CREATE TABLE `t_bogo_department` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `parent_id` bigint DEFAULT NULL COMMENT '上级部门ID',
  `name` varchar(16) NOT NULL COMMENT '部门名称',
  `leader_id` bigint DEFAULT NULL COMMENT '部门负责人UID',
  `organization_id` bigint DEFAULT NULL COMMENT '组织ID',
  `create_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_organization` (`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_department_member` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL COMMENT '用户ID',
  `department_id` bigint NOT NULL COMMENT '部门ID',
  `organization_id` bigint NOT NULL COMMENT '组织ID',
  `title` varchar(255) NOT NULL COMMENT '职位名称',
  `create_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_uid` (`uid`),
  KEY `idx_organization` (`organization_id`,`department_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_emoticon` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `create_time` datetime NOT NULL,
  `description` varchar(200) NOT NULL,
  `name` varchar(16) NOT NULL,
  `type` tinyint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_emoticon_item` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `create_time` datetime NOT NULL,
  `emoticon_id` bigint DEFAULT NULL,
  `name` varchar(16) NOT NULL,
  `type` tinyint NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_emoticon_record` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `create_time` datetime NOT NULL,
  `emoticon_id` bigint DEFAULT NULL,
  `state` tinyint DEFAULT NULL,
  `uid` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_friend_0` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL COMMENT '用户ID',
  `fid` bigint NOT NULL COMMENT '好友用户ID',
  `alias` varchar(16) DEFAULT NULL COMMENT '好友备注',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pk_uid_fid` (`uid`,`fid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='好友关系表';
CREATE TABLE `t_bogo_friend_1` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL COMMENT '用户ID',
  `fid` bigint NOT NULL COMMENT '好友用户ID',
  `alias` varchar(16) DEFAULT NULL COMMENT '好友备注',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pk_uid_fid` (`uid`,`fid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='好友关系表';
CREATE TABLE `t_bogo_friend_2` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL COMMENT '用户ID',
  `fid` bigint NOT NULL COMMENT '好友用户ID',
  `alias` varchar(16) DEFAULT NULL COMMENT '好友备注',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pk_uid_fid` (`uid`,`fid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='好友关系表';
CREATE TABLE `t_bogo_friend_3` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL COMMENT '用户ID',
  `fid` bigint NOT NULL COMMENT '好友用户ID',
  `alias` varchar(16) DEFAULT NULL COMMENT '好友备注',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pk_uid_fid` (`uid`,`fid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='好友关系表';
CREATE TABLE `t_bogo_friend_4` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL COMMENT '用户ID',
  `fid` bigint NOT NULL COMMENT '好友用户ID',
  `alias` varchar(16) DEFAULT NULL COMMENT '好友备注',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pk_uid_fid` (`uid`,`fid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='好友关系表';
CREATE TABLE `t_bogo_friend_5` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL COMMENT '用户ID',
  `fid` bigint NOT NULL COMMENT '好友用户ID',
  `alias` varchar(16) DEFAULT NULL COMMENT '好友备注',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pk_uid_fid` (`uid`,`fid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='好友关系表';
CREATE TABLE `t_bogo_friend_6` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL COMMENT '用户ID',
  `fid` bigint NOT NULL COMMENT '好友用户ID',
  `alias` varchar(16) DEFAULT NULL COMMENT '好友备注',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pk_uid_fid` (`uid`,`fid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='好友关系表';
CREATE TABLE `t_bogo_friend_7` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL COMMENT '用户ID',
  `fid` bigint NOT NULL COMMENT '好友用户ID',
  `alias` varchar(16) DEFAULT NULL COMMENT '好友备注',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pk_uid_fid` (`uid`,`fid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='好友关系表';
CREATE TABLE `t_bogo_friend_8` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL COMMENT '用户ID',
  `fid` bigint NOT NULL COMMENT '好友用户ID',
  `alias` varchar(16) DEFAULT NULL COMMENT '好友备注',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pk_uid_fid` (`uid`,`fid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='好友关系表';
CREATE TABLE `t_bogo_friend_9` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL COMMENT '用户ID',
  `fid` bigint NOT NULL COMMENT '好友用户ID',
  `alias` varchar(16) DEFAULT NULL COMMENT '好友备注',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pk_uid_fid` (`uid`,`fid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='好友关系表';
CREATE TABLE `t_bogo_group` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL COMMENT '创建者用户ID',
  `name` varchar(32) NOT NULL COMMENT '群名称',
  `notice` varchar(2048) DEFAULT NULL COMMENT '群公告',
  `state` tinyint NOT NULL COMMENT '0:正常 1:禁言中',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `IDX_UID` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=1000 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='群组表';
CREATE TABLE `t_bogo_group_member` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` bigint NOT NULL,
  `uid` bigint NOT NULL,
  `name` varchar(20) DEFAULT NULL COMMENT '成员名称',
  `alias` varchar(16) DEFAULT NULL COMMENT '成员群昵称',
  `type` tinyint NOT NULL COMMENT '0:普通成员 1:群主',
  `create_time` datetime NOT NULL COMMENT '入群时间',
  PRIMARY KEY (`id`),
  KEY `IDX_GROUP_ID` (`group_id`),
  KEY `IDX_UID` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='群成员记录表';
CREATE TABLE `t_bogo_group_notice` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL COMMENT '公告发送者UID',
  `group_id` bigint NOT NULL COMMENT '群组ID',
  `text` text NOT NULL COMMENT '公告内容',
  `create_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_group_id` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='群公告记录表';
CREATE TABLE `t_bogo_group_robot` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `group_id` bigint NOT NULL COMMENT '群ID',
  `uid` bigint NOT NULL COMMENT '创建者UID',
  `name` varchar(16) NOT NULL COMMENT '名称',
  `state` tinyint NOT NULL COMMENT '0:禁用 1:启用',
  `webhook` varchar(320) DEFAULT NULL COMMENT 'at消息处理webhook',
  `uuid` varchar(64) NOT NULL COMMENT '机器人唯一ID',
  `create_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_GROUP_ID` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='群机器人信息表';
CREATE TABLE `t_bogo_manager` (
  `account` varchar(20) NOT NULL,
  `name` varchar(16) DEFAULT NULL,
  `password` varchar(64) DEFAULT NULL,
  `state` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`account`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='后台管理员账号信息表';
CREATE TABLE `t_bogo_meeting` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL COMMENT '创建人UID',
  `tag` varchar(32) NOT NULL COMMENT '房间号码',
  `title` varchar(64) DEFAULT NULL COMMENT '会议主题',
  `description` text COMMENT '会议描述',
  `due_time` varchar(32) DEFAULT NULL COMMENT '预定开始时间',
  `create_time` datetime NOT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_TAG` (`tag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='会议记录表';
CREATE TABLE `t_bogo_message_app` (
  `id` bigint NOT NULL,
  `action` varchar(6) NOT NULL,
  `content` varchar(3200) DEFAULT NULL,
  `create_time` bigint NOT NULL COMMENT '消息时间戳13位',
  `format` tinyint DEFAULT NULL,
  `state` tinyint NOT NULL,
  `app_id` bigint NOT NULL,
  `uid` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_app_id` (`app_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_message_chat` (
  `id` bigint NOT NULL,
  `action` varchar(6) NOT NULL,
  `content` text,
  `create_time` bigint NOT NULL COMMENT '消息时间戳13位',
  `extra` varchar(1000) DEFAULT NULL,
  `format` tinyint DEFAULT NULL,
  `state` tinyint NOT NULL,
  `receiver` bigint DEFAULT NULL,
  `sender` bigint NOT NULL,
  `title` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_from_id` (`sender`),
  KEY `idx_to_id` (`receiver`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_message_event` (
  `id` bigint NOT NULL,
  `action` varchar(6) NOT NULL,
  `content` text,
  `create_time` bigint NOT NULL COMMENT '消息时间戳13位',
  `extra` varchar(1000) DEFAULT NULL,
  `format` tinyint DEFAULT NULL,
  `state` tinyint NOT NULL,
  `receiver` bigint DEFAULT NULL,
  `sender` bigint NOT NULL,
  `title` varchar(1000) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_message_group` (
  `id` bigint NOT NULL,
  `group_id` bigint NOT NULL,
  `uid` bigint NOT NULL,
  `format` tinyint NOT NULL,
  `action` varchar(6) NOT NULL,
  `content` text,
  `extra` varchar(1000) DEFAULT NULL,
  `state` tinyint NOT NULL,
  `read_count` int DEFAULT '0' COMMENT '消息已读人数',
  `create_time` bigint NOT NULL COMMENT '消息时间戳13位',
  PRIMARY KEY (`id`),
  KEY `idx_group_id` (`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_message_index_0` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(6) NOT NULL COMMENT '消息类型',
  `create_time` bigint NOT NULL COMMENT '时间戳',
  `mid` bigint NOT NULL COMMENT '消息ID',
  `uid` bigint NOT NULL COMMENT '接收UID',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=81 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_message_index_1` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(6) NOT NULL COMMENT '消息类型',
  `create_time` bigint NOT NULL COMMENT '时间戳',
  `mid` bigint NOT NULL COMMENT '消息ID',
  `uid` bigint NOT NULL COMMENT '接收UID',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_message_index_2` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(6) NOT NULL COMMENT '消息类型',
  `create_time` bigint NOT NULL COMMENT '时间戳',
  `mid` bigint NOT NULL COMMENT '消息ID',
  `uid` bigint NOT NULL COMMENT '接收UID',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_message_index_3` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(6) NOT NULL COMMENT '消息类型',
  `create_time` bigint NOT NULL COMMENT '时间戳',
  `mid` bigint NOT NULL COMMENT '消息ID',
  `uid` bigint NOT NULL COMMENT '接收UID',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_message_index_4` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(6) NOT NULL COMMENT '消息类型',
  `create_time` bigint NOT NULL COMMENT '时间戳',
  `mid` bigint NOT NULL COMMENT '消息ID',
  `uid` bigint NOT NULL COMMENT '接收UID',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_message_index_5` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(6) NOT NULL COMMENT '消息类型',
  `create_time` bigint NOT NULL COMMENT '时间戳',
  `mid` bigint NOT NULL COMMENT '消息ID',
  `uid` bigint NOT NULL COMMENT '接收UID',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_message_index_6` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(6) NOT NULL COMMENT '消息类型',
  `create_time` bigint NOT NULL COMMENT '时间戳',
  `mid` bigint NOT NULL COMMENT '消息ID',
  `uid` bigint NOT NULL COMMENT '接收UID',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_message_index_7` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(6) NOT NULL COMMENT '消息类型',
  `create_time` bigint NOT NULL COMMENT '时间戳',
  `mid` bigint NOT NULL COMMENT '消息ID',
  `uid` bigint NOT NULL COMMENT '接收UID',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_message_index_8` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(6) NOT NULL COMMENT '消息类型',
  `create_time` bigint NOT NULL COMMENT '时间戳',
  `mid` bigint NOT NULL COMMENT '消息ID',
  `uid` bigint NOT NULL COMMENT '接收UID',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_message_index_9` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(6) NOT NULL COMMENT '消息类型',
  `create_time` bigint NOT NULL COMMENT '时间戳',
  `mid` bigint NOT NULL COMMENT '消息ID',
  `uid` bigint NOT NULL COMMENT '接收UID',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_message_patch_0` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(6) NOT NULL COMMENT '消息类型',
  `create_time` bigint NOT NULL COMMENT '时间戳',
  `mid` bigint NOT NULL COMMENT '消息ID',
  `uid` bigint NOT NULL COMMENT '接收UID',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=102 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='消息多端同步补偿表';
CREATE TABLE `t_bogo_message_patch_1` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(6) NOT NULL COMMENT '消息类型',
  `create_time` bigint NOT NULL COMMENT '时间戳',
  `mid` bigint NOT NULL COMMENT '消息ID',
  `uid` bigint NOT NULL COMMENT '接收UID',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_message_patch_2` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(6) NOT NULL COMMENT '消息类型',
  `create_time` bigint NOT NULL COMMENT '时间戳',
  `mid` bigint NOT NULL COMMENT '消息ID',
  `uid` bigint NOT NULL COMMENT '接收UID',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_message_patch_3` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(6) NOT NULL COMMENT '消息类型',
  `create_time` bigint NOT NULL COMMENT '时间戳',
  `mid` bigint NOT NULL COMMENT '消息ID',
  `uid` bigint NOT NULL COMMENT '接收UID',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_message_patch_4` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(6) NOT NULL COMMENT '消息类型',
  `create_time` bigint NOT NULL COMMENT '时间戳',
  `mid` bigint NOT NULL COMMENT '消息ID',
  `uid` bigint NOT NULL COMMENT '接收UID',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_message_patch_5` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(6) NOT NULL COMMENT '消息类型',
  `create_time` bigint NOT NULL COMMENT '时间戳',
  `mid` bigint NOT NULL COMMENT '消息ID',
  `uid` bigint NOT NULL COMMENT '接收UID',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_message_patch_6` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(6) NOT NULL COMMENT '消息类型',
  `create_time` bigint NOT NULL COMMENT '时间戳',
  `mid` bigint NOT NULL COMMENT '消息ID',
  `uid` bigint NOT NULL COMMENT '接收UID',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_message_patch_7` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(6) NOT NULL COMMENT '消息类型',
  `create_time` bigint NOT NULL COMMENT '时间戳',
  `mid` bigint NOT NULL COMMENT '消息ID',
  `uid` bigint NOT NULL COMMENT '接收UID',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_message_patch_8` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(6) NOT NULL COMMENT '消息类型',
  `create_time` bigint NOT NULL COMMENT '时间戳',
  `mid` bigint NOT NULL COMMENT '消息ID',
  `uid` bigint NOT NULL COMMENT '接收UID',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_message_patch_9` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` varchar(6) NOT NULL COMMENT '消息类型',
  `create_time` bigint NOT NULL COMMENT '时间戳',
  `mid` bigint NOT NULL COMMENT '消息ID',
  `uid` bigint NOT NULL COMMENT '接收UID',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_message_system` (
  `id` bigint NOT NULL,
  `action` varchar(6) NOT NULL,
  `content` text,
  `create_time` bigint NOT NULL COMMENT '消息时间戳13位',
  `extra` varchar(1000) DEFAULT NULL,
  `format` tinyint DEFAULT NULL,
  `state` tinyint NOT NULL,
  `title` varchar(100) DEFAULT NULL,
  `uid` bigint DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_micro_app` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `color` varchar(10) DEFAULT NULL,
  `create_time` datetime NOT NULL,
  `name` varchar(20) NOT NULL,
  `sort` int DEFAULT NULL,
  `url` varchar(320) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_micro_server` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `account` varchar(32) NOT NULL COMMENT '账号，唯一',
  `name` varchar(20) NOT NULL,
  `description` varchar(320) DEFAULT NULL,
  `greet` varchar(320) DEFAULT NULL COMMENT '关注后的欢迎语',
  `webhook` varchar(320) DEFAULT NULL COMMENT '回复内容和菜单点击处理的接口地址',
  `website` varchar(320) DEFAULT NULL COMMENT '主页地址',
  `create_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_ACCOUNT` (`account`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='公众号号信息表';
CREATE TABLE `t_bogo_micro_server_menu` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `server_id` bigint NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  `code` varchar(32) NOT NULL,
  `content` varchar(1024) DEFAULT NULL,
  `name` varchar(20) NOT NULL,
  `type` tinyint NOT NULL,
  `sort` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_SERVER_ID` (`server_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='公众号菜单记录表';
CREATE TABLE `t_bogo_moment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `content` varchar(2000) DEFAULT NULL,
  `metadata` text,
  `text` varchar(1000) DEFAULT NULL,
  `type` tinyint NOT NULL,
  `visible_type` tinyint NOT NULL DEFAULT '0' COMMENT '0:公开 1:私有 2:部分可见 3:部分不可见',
  `create_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_UID` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='朋友圈内容表';
CREATE TABLE `t_bogo_moment_comment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `moment_id` bigint NOT NULL,
  `parent_id` bigint DEFAULT NULL,
  `content` varchar(320) DEFAULT NULL,
  `type` tinyint NOT NULL COMMENT '0:评论文章 1:回复评论 2:点赞',
  `is_deleted` bit(1) DEFAULT NULL COMMENT '1 已经删除',
  `create_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_MOMENT_ID` (`moment_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='朋友圈评论表';
CREATE TABLE `t_bogo_moment_rule` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `target_id` bigint NOT NULL COMMENT '对方用户ID',
  `type` tinyint NOT NULL COMMENT '0：不让对方看  1：不看对方',
  PRIMARY KEY (`id`),
  KEY `IDX_TARGET_ID` (`target_id`),
  KEY `IDX_UID` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='朋友圈权限设置表';
CREATE TABLE `t_bogo_note` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `text` text COMMENT '描述信息',
  `content` text NOT NULL COMMENT '内容',
  `extra` text COMMENT '扩展信息',
  `format` tinyint NOT NULL COMMENT '内容格式\n0 文字\n1 图片\n3 视频\n4 附件\n5 位置\n6 链接\n',
  `create_time` datetime NOT NULL COMMENT '添加时间',
  `update_time` datetime NOT NULL COMMENT '最近修改时间',
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='笔记信息表';
CREATE TABLE `t_bogo_organization` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(16) NOT NULL COMMENT '组织名称',
  `create_time` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_session` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nid` varchar(32) DEFAULT NULL COMMENT '长连接ID，单台物理机级别唯一',
  `uid` bigint NOT NULL COMMENT '用户ID',
  `host` varchar(15) NOT NULL COMMENT '服务器IP',
  `channel` varchar(32) NOT NULL COMMENT '客户端终端类型',
  `device_id` varchar(64) NOT NULL COMMENT '客户端设备ID',
  `device_name` varchar(32) DEFAULT NULL COMMENT '客户端设备名称',
  `os_version` varchar(32) DEFAULT NULL COMMENT '客户端OS系统版本',
  `app_version` varchar(32) DEFAULT NULL COMMENT '客户端应用版本',
  `state` tinyint NOT NULL COMMENT '0:在线 1:APNS在线 2:离线 ',
  `language` varchar(16) DEFAULT NULL COMMENT '客户端语音，如:zh-CN',
  `bind_time` bigint DEFAULT NULL COMMENT '上线时间戳',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_uid_device_id` (`uid`,`device_id`)
) ENGINE=InnoDB AUTO_INCREMENT=215 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_silent_notification` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL COMMENT '用户ID',
  `target_id` bigint NOT NULL COMMENT '名单ID',
  `type` tinyint NOT NULL COMMENT '名单类型 1:联系人 2:群 3:系统 4:公众号',
  `create_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_uid` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_bogo_subscriber` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `server_id` bigint NOT NULL COMMENT '公众号ID',
  `uid` bigint NOT NULL,
  `create_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_SERVER_ID` (`server_id`),
  KEY `IDX_UID` (`uid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='公众号订阅关系记录表';
CREATE TABLE `t_bogo_user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(16) NOT NULL,
  `account` varchar(16) NOT NULL,
  `telephone` varchar(15) NOT NULL COMMENT '手机号码',
  `password` varchar(64) NOT NULL COMMENT 'MD5密文',
  `organization_id` bigint DEFAULT NULL,
  `gender` tinyint DEFAULT NULL COMMENT '0女  1男',
  `motto` varchar(200) DEFAULT NULL COMMENT '签名信息',
  `email` varchar(50) DEFAULT NULL,
  `state` tinyint NOT NULL COMMENT '状态 1:禁用 0:正常',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_TELEPHONE` (`telephone`)
) ENGINE=InnoDB AUTO_INCREMENT=10010 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='用户信息表';
CREATE TABLE `t_bogo_validation_code` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `telephone` varchar(15) NOT NULL,
  `action` int NOT NULL COMMENT '业务分类',
  `code` varchar(8) NOT NULL COMMENT '验证码',
  `create_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_TELEPHONE_ACTION` (`telephone`,`action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='验证码记录表';
CREATE TABLE `t_live_anchor` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `account` varchar(32) NOT NULL,
  `password` varchar(64) NOT NULL,
  `name` varchar(32) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `intro` varchar(255) DEFAULT NULL,
  `tags_json` varchar(1000) DEFAULT NULL,
  `state` tinyint NOT NULL DEFAULT '0',
  `create_time` datetime NOT NULL,
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_live_anchor_account` (`account`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='主播账号表';
CREATE TABLE `t_live_anchor_config` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `anchor_id` bigint NOT NULL COMMENT '主播ID',
  `push_server` varchar(255) NOT NULL COMMENT 'OBS推流服务器地址',
  `stream_key` varchar(128) NOT NULL COMMENT '推流密钥',
  `play_url` varchar(500) NOT NULL COMMENT 'HLS播放地址',
  `default_title` varchar(64) DEFAULT NULL COMMENT '默认直播标题',
  `default_cover` varchar(255) DEFAULT NULL COMMENT '默认直播封面',
  `invite_code` varchar(64) DEFAULT NULL COMMENT '直播邀请码',
  `status` tinyint NOT NULL COMMENT '0:正常 1:停用',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `create_time` datetime NOT NULL,
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_live_anchor_config_anchor` (`anchor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='主播直播配置表';
CREATE TABLE `t_live_anchor_follower` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `anchor_id` bigint NOT NULL,
  `create_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_live_anchor_follower_uid_anchor` (`uid`,`anchor_id`),
  KEY `idx_live_anchor_follower_anchor` (`anchor_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_live_anchor_gallery` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `anchor_id` bigint NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `sort` int DEFAULT '0',
  `status` tinyint NOT NULL DEFAULT '0',
  `create_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_live_anchor_gallery_anchor` (`anchor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='主播附图表';
CREATE TABLE `t_live_chat_session` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `owner_uid` bigint NOT NULL,
  `session_type` varchar(32) NOT NULL,
  `target_uid` bigint NOT NULL,
  `last_message` varchar(500) DEFAULT NULL,
  `last_message_time` datetime DEFAULT NULL,
  `unread_count` int NOT NULL DEFAULT '0',
  `top_flag` bit(1) NOT NULL DEFAULT b'0',
  `official_flag` bit(1) NOT NULL DEFAULT b'0',
  `create_time` datetime NOT NULL,
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_live_chat_session_owner_target` (`owner_uid`,`target_uid`),
  KEY `idx_live_chat_session_owner_time` (`owner_uid`,`last_message_time`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='会话聚合表';
CREATE TABLE `t_live_customer_service_account` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `name` varchar(32) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `official` bit(1) NOT NULL DEFAULT b'1',
  `status` tinyint NOT NULL DEFAULT '0',
  `sort` int DEFAULT '0',
  `create_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_live_customer_service_uid` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='客服账号配置表';
CREATE TABLE `t_live_friend_apply` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `fid` bigint NOT NULL,
  `message` varchar(500) DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '0',
  `handle_time` datetime DEFAULT NULL,
  `create_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_live_friend_apply_uid_status` (`uid`,`status`),
  KEY `idx_live_friend_apply_fid_status` (`fid`,`status`),
  KEY `idx_live_friend_apply_uid_fid` (`uid`,`fid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
CREATE TABLE `t_live_gift` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `type` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(32) NOT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `resource` varchar(255) DEFAULT NULL,
  `price` bigint NOT NULL,
  `sort` int DEFAULT '0',
  `remark` varchar(255) DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '0',
  `create_time` datetime NOT NULL,
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='礼物配置表';
CREATE TABLE `t_live_gift_record` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `anchor_id` bigint NOT NULL,
  `room_id` bigint NOT NULL,
  `gift_id` bigint NOT NULL,
  `count` int NOT NULL,
  `unit_price` bigint NOT NULL,
  `total_amount` bigint NOT NULL,
  `create_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_live_gift_record_uid` (`uid`,`id`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='送礼记录表';
CREATE TABLE `t_live_invite_code` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `code` varchar(32) NOT NULL,
  `status` tinyint NOT NULL DEFAULT '0',
  `used_uid` bigint DEFAULT NULL,
  `used_time` datetime DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `create_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_live_invite_code_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='邀请码表';
CREATE TABLE `t_live_message` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `room_id` bigint NOT NULL,
  `uid` bigint NOT NULL,
  `message_type` varchar(16) NOT NULL,
  `content` varchar(500) NOT NULL,
  `create_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_live_message_room` (`room_id`,`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='直播公屏消息表';
CREATE TABLE `t_live_reward_record` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `anchor_id` bigint NOT NULL,
  `room_id` bigint NOT NULL,
  `amount` bigint NOT NULL,
  `message` varchar(255) DEFAULT NULL,
  `create_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_live_reward_record_uid` (`uid`,`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='打赏记录表';
CREATE TABLE `t_live_room` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `anchor_id` bigint NOT NULL,
  `room_no` varchar(64) DEFAULT NULL,
  `title` varchar(64) DEFAULT NULL,
  `cover` varchar(255) DEFAULT NULL,
  `invite_code` varchar(64) DEFAULT NULL COMMENT '房间邀请码',
  `status` tinyint NOT NULL DEFAULT '0',
  `room_tag` varchar(64) DEFAULT NULL,
  `play_url` varchar(500) DEFAULT NULL,
  `online_count` int NOT NULL DEFAULT '0',
  `heat` int NOT NULL DEFAULT '0',
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `create_time` datetime NOT NULL,
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_live_room_anchor` (`anchor_id`,`end_time`) USING BTREE,
  KEY `idx_live_room_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='直播房间表';
CREATE TABLE `t_live_room_enter_record` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `room_id` bigint NOT NULL,
  `uid` bigint NOT NULL,
  `enter_time` datetime NOT NULL,
  `leave_time` datetime DEFAULT NULL,
  `duration_seconds` int DEFAULT NULL,
  `source` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_live_enter_room_uid` (`room_id`,`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=199 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='直播进房记录表';
CREATE TABLE `t_live_wallet` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `balance` bigint NOT NULL DEFAULT '0',
  `freeze_balance` bigint NOT NULL DEFAULT '0',
  `total_recharge` bigint NOT NULL DEFAULT '0',
  `total_consume` bigint NOT NULL DEFAULT '0',
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_live_wallet_uid` (`uid`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='钱包表';
CREATE TABLE `t_live_wallet_record` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `uid` bigint NOT NULL,
  `change_type` varchar(32) NOT NULL,
  `change_amount` bigint NOT NULL,
  `before_balance` bigint NOT NULL,
  `after_balance` bigint NOT NULL,
  `biz_id` bigint DEFAULT NULL,
  `biz_type` varchar(32) DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `create_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_live_wallet_record_uid` (`uid`,`id`)
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='钱包流水表';
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_blackword` WRITE;
DELETE FROM `bogo_db`.`t_bogo_blackword`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_config` WRITE;
DELETE FROM `bogo_db`.`t_bogo_config`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_department` WRITE;
DELETE FROM `bogo_db`.`t_bogo_department`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_department_member` WRITE;
DELETE FROM `bogo_db`.`t_bogo_department_member`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_emoticon` WRITE;
DELETE FROM `bogo_db`.`t_bogo_emoticon`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_emoticon_item` WRITE;
DELETE FROM `bogo_db`.`t_bogo_emoticon_item`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_emoticon_record` WRITE;
DELETE FROM `bogo_db`.`t_bogo_emoticon_record`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_friend_0` WRITE;
DELETE FROM `bogo_db`.`t_bogo_friend_0`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_friend_1` WRITE;
DELETE FROM `bogo_db`.`t_bogo_friend_1`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_friend_2` WRITE;
DELETE FROM `bogo_db`.`t_bogo_friend_2`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_friend_3` WRITE;
DELETE FROM `bogo_db`.`t_bogo_friend_3`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_friend_4` WRITE;
DELETE FROM `bogo_db`.`t_bogo_friend_4`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_friend_5` WRITE;
DELETE FROM `bogo_db`.`t_bogo_friend_5`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_friend_6` WRITE;
DELETE FROM `bogo_db`.`t_bogo_friend_6`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_friend_7` WRITE;
DELETE FROM `bogo_db`.`t_bogo_friend_7`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_friend_8` WRITE;
DELETE FROM `bogo_db`.`t_bogo_friend_8`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_friend_9` WRITE;
DELETE FROM `bogo_db`.`t_bogo_friend_9`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_group` WRITE;
DELETE FROM `bogo_db`.`t_bogo_group`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_group_member` WRITE;
DELETE FROM `bogo_db`.`t_bogo_group_member`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_group_notice` WRITE;
DELETE FROM `bogo_db`.`t_bogo_group_notice`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_group_robot` WRITE;
DELETE FROM `bogo_db`.`t_bogo_group_robot`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_manager` WRITE;
DELETE FROM `bogo_db`.`t_bogo_manager`;
INSERT INTO `bogo_db`.`t_bogo_manager` (`account`,`name`,`password`,`state`) VALUES ('admin', 'admin', '54b53072540eeeb8f8e9343e71f28176', NULL)
;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_meeting` WRITE;
DELETE FROM `bogo_db`.`t_bogo_meeting`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_app` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_app`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_chat` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_chat`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_event` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_event`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_group` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_group`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_index_0` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_index_0`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_index_1` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_index_1`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_index_2` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_index_2`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_index_3` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_index_3`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_index_4` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_index_4`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_index_5` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_index_5`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_index_6` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_index_6`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_index_7` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_index_7`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_index_8` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_index_8`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_index_9` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_index_9`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_patch_0` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_patch_0`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_patch_1` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_patch_1`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_patch_2` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_patch_2`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_patch_3` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_patch_3`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_patch_4` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_patch_4`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_patch_5` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_patch_5`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_patch_6` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_patch_6`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_patch_7` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_patch_7`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_patch_8` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_patch_8`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_patch_9` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_patch_9`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_message_system` WRITE;
DELETE FROM `bogo_db`.`t_bogo_message_system`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_micro_app` WRITE;
DELETE FROM `bogo_db`.`t_bogo_micro_app`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_micro_server` WRITE;
DELETE FROM `bogo_db`.`t_bogo_micro_server`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_micro_server_menu` WRITE;
DELETE FROM `bogo_db`.`t_bogo_micro_server_menu`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_moment` WRITE;
DELETE FROM `bogo_db`.`t_bogo_moment`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_moment_comment` WRITE;
DELETE FROM `bogo_db`.`t_bogo_moment_comment`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_moment_rule` WRITE;
DELETE FROM `bogo_db`.`t_bogo_moment_rule`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_note` WRITE;
DELETE FROM `bogo_db`.`t_bogo_note`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_organization` WRITE;
DELETE FROM `bogo_db`.`t_bogo_organization`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_session` WRITE;
 
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_silent_notification` WRITE;
DELETE FROM `bogo_db`.`t_bogo_silent_notification`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_subscriber` WRITE;
DELETE FROM `bogo_db`.`t_bogo_subscriber`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_user` WRITE;
DELETE FROM `bogo_db`.`t_bogo_user`;
INSERT INTO `bogo_db`.`t_bogo_user` (`id`,`name`,`account`,`telephone`,`password`,`organization_id`,`gender`,`motto`,`email`,`state`,`create_time`) VALUES
 (10000, 'Service', 'cs001', '+8613000000000', '$2a$04$6EOkvQh53puujInRGKNIGull56Lz54AhmC3oscoDeoaHBZEH3LN1i', NULL, 0, NULL, 'service@service.cn', 0, '2022-06-15 00:00:00');
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_bogo_validation_code` WRITE;
DELETE FROM `bogo_db`.`t_bogo_validation_code`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_live_anchor` WRITE;
 
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_live_anchor_config` WRITE;
DELETE FROM `bogo_db`.`t_live_anchor_config`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_live_anchor_follower` WRITE;
 
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_live_anchor_gallery` WRITE;
DELETE FROM `bogo_db`.`t_live_anchor_gallery`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_live_chat_session` WRITE;
 
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_live_customer_service_account` WRITE;
 
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_live_friend_apply` WRITE;
DELETE FROM `bogo_db`.`t_live_friend_apply`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_live_gift` WRITE;
DELETE FROM `bogo_db`.`t_live_gift`;
INSERT INTO `bogo_db`.`t_live_gift` (`id`,`type`,`name`,`icon`,`resource`,`price`,`sort`,`remark`,`status`,`create_time`,`update_time`) VALUES (1, 'SVGA', '香蕉', '/file/live-gift/1', '/file/live-gift/1.svga', 2, 2, NULL, 0, '2026-05-08 07:28:09', '2026-05-17 20:19:05'),(2, 'SVGA', '冰激凌', '/file/live-gift/2', '/file/live-gift/2.svga', 5, 0, NULL, 0, '2026-05-08 07:30:01', '2026-05-17 20:17:31'),(3, 'SVGA', '666', '/file/live-gift/3', '/file/live-gift/3.svga', 6, 6, '666', 0, '2026-05-08 07:30:13', '2026-05-17 20:03:14'),(4, 'SVGA', '风车', '/file/live-gift/4', '/file/live-gift/4.svga', 4, 4, NULL, 0, '2026-05-24 11:37:21', '2026-05-24 11:37:21'),(5, 'STATIC', '铃铛', '/file/live-gift/5', '/file/live-gift/5.png', 1, 1, NULL, 0, '2026-05-24 11:38:32', '2026-05-24 11:38:32')
;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_live_gift_record` WRITE;
 
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_live_invite_code` WRITE;
 
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_live_message` WRITE;
 
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_live_reward_record` WRITE;
DELETE FROM `bogo_db`.`t_live_reward_record`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_live_room` WRITE;
DELETE FROM `bogo_db`.`t_live_room`;
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_live_room_enter_record` WRITE;
 
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_live_wallet` WRITE;
 
UNLOCK TABLES;
COMMIT;
BEGIN;
LOCK TABLES `bogo_db`.`t_live_wallet_record` WRITE;
 
UNLOCK TABLES;
COMMIT;
