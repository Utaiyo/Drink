/**
 * ログAPIエンドポイント
 * 
 * DSSIP Point 5/6/7：客観証拠の収集
 * - ユーザー行動イベントを記録
 * - 開発環境では console.log + JSONファイル追記
 * - 本番環境では外部DB（Supabase等）に差し替え必要
 * 
 * 注意：Vercelではファイル永続化できないため、
 * 本番環境では必ず外部DB（Supabase/PostgreSQL等）に差し替えること
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const event = req.body;
    
    // 開発環境：console.log + ファイル追記
    console.log('[DSS Log]', JSON.stringify(event, null, 2));
    
    // ファイルに追記（開発環境のみ）
    // 注意：Vercelでは永続化できないため、本番では外部DBを使用すること
    if (process.env.NODE_ENV === 'development') {
      const logDir = path.join(process.cwd(), 'logs');
      const logFile = path.join(logDir, 'events.jsonl');
      
      // ディレクトリがなければ作成
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      // JSONL形式で追記
      fs.appendFileSync(logFile, JSON.stringify(event) + '\n');
    }
    
    // 本番環境ではここで外部DB（Supabase等）に保存
    // TODO: Supabase等のDB接続を実装
    // if (process.env.NODE_ENV === 'production') {
    //   await supabase.from('dss_events').insert(event);
    // }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Log API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

