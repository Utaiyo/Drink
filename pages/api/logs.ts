/**
 * ログ取得APIエンドポイント（ダッシュボード用）
 * 
 * DSSIP Point 5/6/7：客観証拠の取得
 * - 開発環境：ローカルファイルから読み込み
 * - 本番環境：外部DB（Supabase等）から取得
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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 開発環境：ローカルファイルから読み込み
    if (process.env.NODE_ENV === 'development') {
      const logFile = path.join(process.cwd(), 'logs', 'events.jsonl');
      
      if (!fs.existsSync(logFile)) {
        return res.status(200).json([]);
      }
      
      const fileContent = fs.readFileSync(logFile, 'utf-8');
      const lines = fileContent.trim().split('\n').filter(Boolean);
      const events = lines.map(line => JSON.parse(line));
      
      return res.status(200).json(events);
    }
    
    // 本番環境：外部DBから取得
    // TODO: Supabase等のDB接続を実装
    // if (process.env.NODE_ENV === 'production') {
    //   const { data, error } = await supabase
    //     .from('dss_events')
    //     .select('*')
    //     .order('timestamp', { ascending: false })
    //     .limit(1000);
    //   
    //   if (error) throw error;
    //   return res.status(200).json(data);
    // }
    
    // デフォルト：空配列を返す
    res.status(200).json([]);
  } catch (error) {
    console.error('Logs API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

