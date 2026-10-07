CREATE DATABASE `rootmap` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;


-- rootmap_1.affixes definition

CREATE TABLE `affixes` (
  `id` varchar(64) NOT NULL,
  `text` varchar(32) NOT NULL,
  `type` enum('prefix','suffix') NOT NULL,
  `group_name` varchar(64) NOT NULL,
  `zh` varchar(64) NOT NULL,
  `note` text,
  `origin` enum('hand','dict','gen') NOT NULL DEFAULT 'gen',
  `seq` int NOT NULL DEFAULT '0',
  `merge_into` varchar(64) DEFAULT NULL,
  `allow_single_letter` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_affixes_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- rootmap_1.cet4_candidates definition

CREATE TABLE `cet4_candidates` (
  `id` varchar(64) NOT NULL,
  `word` varchar(64) NOT NULL,
  `decomposable` tinyint NOT NULL DEFAULT '0' COMMENT '1 = 拆得动(有 root 段),0 = 整词 none',
  `payload` json NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cand_decomposable` (`decomposable`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- rootmap_1.cet4_corpus definition

CREATE TABLE `cet4_corpus` (
  `id` varchar(64) NOT NULL,
  `word` varchar(64) NOT NULL,
  `source` varchar(32) NOT NULL COMMENT '语料文件来源(cet4 / gz 等)',
  `raw` json NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_corpus_word` (`word`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- rootmap_1.content_merge_log definition

CREATE TABLE `content_merge_log` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `version` char(40) NOT NULL,
  `built_at` varchar(25) NOT NULL,
  `stats` json NOT NULL COMMENT '{handWords, genWords, stories, genFamilies}',
  `overrides` json DEFAULT NULL COMMENT '{"root-xxx":{"variants_appended":[...]}, "affix-xx":{"zh":...,"note":...}}',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- rootmap_1.decompose_verdict definition

CREATE TABLE `decompose_verdict` (
  `word` varchar(64) NOT NULL,
  `verdict` enum('reject','exclude') NOT NULL,
  `reason` text NOT NULL COMMENT '为什么否决 —— 审校时写下的理由,是这张表存在的全部意义',
  `regression_group` varchar(128) DEFAULT NULL COMMENT '非空 = 额外钉一条「不得出现在交付集」的回归',
  PRIMARY KEY (`word`),
  KEY `idx_verdict_regression` (`regression_group`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- rootmap_1.error_logs definition

CREATE TABLE `error_logs` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL,
  `type` varchar(20) NOT NULL,
  `message` text NOT NULL,
  `stack` text,
  `context` json DEFAULT NULL,
  `created_at` varchar(25) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_error_user` (`user_id`),
  KEY `idx_error_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- rootmap_1.events definition

CREATE TABLE `events` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned NOT NULL,
  `type` enum('study','review') NOT NULL,
  `word_id` varchar(64) NOT NULL,
  `q` tinyint DEFAULT NULL COMMENT '正确答案选项',
  `at` varchar(25) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_events_user_at` (`user_id`,`at`),
  KEY `idx_events_user_type` (`user_id`,`type`),
  KEY `idx_events_word` (`word_id`)
) ENGINE=InnoDB AUTO_INCREMENT=203 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- rootmap_1.root_progress definition

CREATE TABLE `root_progress` (
  `user_id` int unsigned NOT NULL,
  `root_id` varchar(64) NOT NULL,
  `learned_words` json DEFAULT NULL COMMENT '已学习的单词ID列表',
  `learned_at` varchar(25) DEFAULT NULL COMMENT '首次学习时间',
  `reviewed_at` varchar(25) DEFAULT NULL COMMENT '最近复习时间',
  `review_count` int DEFAULT '0' COMMENT '复习次数',
  `correct_count` int DEFAULT '0' COMMENT '正确次数',
  `level` enum('new','learning','familiar','master') DEFAULT 'new',
  PRIMARY KEY (`user_id`,`root_id`),
  KEY `idx_root_user_level` (`user_id`,`level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- rootmap_1.roots definition

CREATE TABLE `roots` (
  `id` varchar(64) NOT NULL,
  `root` varchar(32) NOT NULL,
  `variants` json NOT NULL COMMENT '词根变体列表,如 ["spect","spec"]',
  `zh` varchar(64) NOT NULL COMMENT '中文义',
  `group_name` varchar(64) NOT NULL COMMENT '分组',
  `meaning` varchar(255) DEFAULT NULL COMMENT '详细含义',
  `story` text COMMENT '词源助记',
  `origin` enum('hand','dict','gen') NOT NULL DEFAULT 'gen',
  `seq` int NOT NULL DEFAULT '0',
  `word_count` int NOT NULL DEFAULT '0' COMMENT '关联单词数(由 words.root_id 聚合回填)',
  PRIMARY KEY (`id`),
  KEY `idx_roots_root` (`root`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- rootmap_1.sessions definition

CREATE TABLE `sessions` (
  `token` char(48) NOT NULL,
  `user_id` int unsigned NOT NULL,
  `created_at` varchar(25) NOT NULL,
  `expires_at` varchar(25) NOT NULL,
  PRIMARY KEY (`token`),
  KEY `idx_sessions_user` (`user_id`),
  KEY `idx_sessions_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- rootmap_1.users definition

CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `openid` varchar(64) NOT NULL,
  `created_at` varchar(25) NOT NULL,
  `settings` json DEFAULT NULL COMMENT '用户设置，如每日复习上限等',
  `nickname` varchar(64) DEFAULT NULL,
  `avatar_url` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `openid` (`openid`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- rootmap_1.word_breakdown definition

CREATE TABLE `word_breakdown` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `word_id` varchar(64) NOT NULL,
  `seq` int NOT NULL DEFAULT '0',
  `part` varchar(64) NOT NULL COMMENT '拼写片段',
  `type` varchar(16) NOT NULL COMMENT 'prefix/root/suffix/none',
  `zh` varchar(64) DEFAULT NULL,
  `ref_id` varchar(64) DEFAULT NULL COMMENT '指向 roots.id 或 affixes.id',
  PRIMARY KEY (`id`),
  KEY `idx_breakdown_word` (`word_id`),
  KEY `idx_breakdown_ref` (`ref_id`)
) ENGINE=InnoDB AUTO_INCREMENT=72582 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- rootmap_1.word_examples definition

CREATE TABLE `word_examples` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `word_id` varchar(64) NOT NULL,
  `seq` int NOT NULL DEFAULT '0',
  `en` text NOT NULL,
  `zh` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_examples_word` (`word_id`)
) ENGINE=InnoDB AUTO_INCREMENT=71423 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- rootmap_1.word_patches definition

CREATE TABLE `word_patches` (
  `word_id` varchar(64) NOT NULL,
  `phonetic` varchar(64) DEFAULT NULL,
  `example_en` text,
  `example_zh` text,
  PRIMARY KEY (`word_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- rootmap_1.word_progress definition

CREATE TABLE `word_progress` (
  `user_id` int unsigned NOT NULL,
  `word_id` varchar(64) NOT NULL,
  `learned_at` varchar(25) DEFAULT NULL COMMENT '首次学习时间',
  `reviewed_at` varchar(25) DEFAULT NULL COMMENT '最近复习时间',
  `review_count` int DEFAULT '0' COMMENT '复习次数',
  `correct_count` int DEFAULT '0' COMMENT '正确次数',
  `level` enum('new','learning','familiar','master') DEFAULT 'new',
  `next_review` varchar(25) NOT NULL DEFAULT (now()),
  PRIMARY KEY (`user_id`,`word_id`),
  KEY `idx_progress_user_level` (`user_id`,`level`),
  KEY `idx_progress_next_review` (`user_id`,`next_review`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- rootmap_1.word_senses definition

CREATE TABLE `word_senses` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `word_id` varchar(64) NOT NULL,
  `seq` int NOT NULL DEFAULT '0',
  `pos` varchar(16) DEFAULT NULL COMMENT '词性,如 v./n./adj.',
  `zh` varchar(255) NOT NULL,
  `en` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_senses_word` (`word_id`)
) ENGINE=InnoDB AUTO_INCREMENT=71493 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- rootmap_1.words definition

CREATE TABLE `words` (
  `id` varchar(64) NOT NULL,
  `word` varchar(64) NOT NULL,
  `phonetic` varchar(64) NOT NULL COMMENT '音标',
  `root_id` varchar(64) DEFAULT NULL COMMENT '所属词根(取自 breakdown 的 root 段 refId)',
  `tags` json DEFAULT NULL COMMENT '标签,如 ["cet4","高频"]',
  `assoc` json DEFAULT NULL COMMENT '联想(同义/反义/派生/易混/词源)',
  `origin` enum('hand','dict','gen') NOT NULL DEFAULT 'gen',
  `seq` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `idx_words_word` (`word`),
  KEY `idx_words_root` (`root_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



