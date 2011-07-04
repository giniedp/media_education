<?php
	require_once('inc.global.php');

  $filename = "importfile.txt";
  $originLanguage = "de";
  $targetLanguage = "en";
  
  //----------------------------------------

function importData($filename, $originLanguage, $targetLanguage) {
  //open file ...
  $file_array = file($filename, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
  // structure:
  //Tag;day
  //deren, dessen, wessen;which one's, of which, whose

  foreach ($file_array as $line) {
    //structure: deren, dessen, wessen;which one's, of which, whose
    
    $originWords = Array();
    $targetWords = Array();
    
    //split on ';' left is origin, right is translation
    $xs = split(";", $line);
    if(count($xs) != 2) {
      Log::debug("ignoring '".$line."'");
      break;
    }
    
    //split on ',' for all words
    //structure: deren, dessen, wessen
    $ys = split(",", $xs[0]);
    foreach ($ys as $y) {
      //structure: deren
      $originWords[] = addslashes(trim($y));
    }
    $ys = split(",", $xs[1]);
    foreach ($ys as $y) {
      //structure: deren
      $targetWords[] = addslashes(trim($y));
    }
    
    //insert all of those and connect...
    //got a lot of entries in originWords and targetWords
    //TODO, check if these exist, if so get id....
    
    //insert all of those...
    $db = DB::getInstance();
    $db->begin();
    $go = true;
    $idsA = Array();
    $idsB = Array();
    //insert origin words
    foreach ($originWords as $word) {
      $sql = "SELECT id FROM `vocabulary` WHERE voc = '".$word."' AND lang = '".$originLanguage."' LIMIT 1;";
      $vocabi = DB::queryAssoc($sql);
      if ($vocabi == null || count($vocabi) == 0) {
        $sql = "INSERT INTO `vocabulary` (lang, voc, regex) VALUES
          ('".$originLanguage."', '".$word."', NULL);";
        if(!$db->sql_query($sql)) {
          $db->rollback();
          $go = false;
          break;
        }
        //id?
        $idsA[] = $db->sql_insert_id();
      }
      else {
        $vocabii = $vocabi[0];
        $idsA[] = $vocabii['id'];
      }
    }
    if(!$go)
      break;

    //insert target words
    foreach ($targetWords as $word) {
      $sql = "SELECT id FROM `vocabulary` WHERE voc = '".$word."' AND lang = '".$targetLanguage."' LIMIT 1;";
      $vocabi = DB::queryAssoc($sql);
      if ($vocabi == null || count($vocabi) == 0) {
        $sql = "INSERT INTO `vocabulary` (lang, voc, regex) VALUES
          ('".$targetLanguage."', '".$word."', NULL);";
        if(!$db->sql_query($sql)) {
          $db->rollback();
          $go = false;
          break;
        }
        //id?
        $idsB[] = $db->sql_insert_id();
      }
      else {
        $vocabii = $vocabi[0];
        $idsA[] = $vocabii['id'];
      }
    }
    
    //if it got messed up somewhere ?!....
    if(!$go)
      break;
      
    $sql = "";
    //add connections for all ids
    foreach($idsA as $idA) {
      $sql = "INSERT INTO `translations` (origin, translation) VALUES ";
        foreach($idsB as $idB) {
          $sql .= "('".$idA."', '".$idB."'), ";
        }
    }
    //remove last ', '
    $sql = substr($sql, 0, -2);
    $sql .= ";";
    //and run it...
    if(!$db->sql_query($sql)) {
      $db->rollback();
      Log::debug("failed to insert ".$line."...");
    }
    
    $db->commit();
  }
}

importData($filename, $originLanguage, $targetLanguage);
print_r(Log::getInstance()->getDebugMsg());
?>
