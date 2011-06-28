<?php

require_once('db.class.php');

class Id {

  private $id;
  private $ident;
  private $hash;
  
  function Id($id, $ident, $hash) {
    $this->id = $id;
    $this->ident = $ident;
    $this->hash = $hash;
  }
  
  static function getIdsForIdents($fbids) {
		$sql = "";
		$count = count($fbids);
		if ($count == 1)
			$sql = "SELECT * FROM ids WHERE `ident` = '". current($fbids). "' LIMIT 1;";
		else if ($count > 1)
			$sql = "SELECT * FROM ids WHERE `ident` IN (". implode(array_values($fbids), ','). ") ORDER BY `name` LIMIT ".$count.";";
		else
			return false;
		$idsarray = DB::queryAssoc($sql);
		if ($idsarray == null || count($idsarray) == 0) {
			Log::debug("sql statement returned no tags match");
			return false; // id(s) not found
		}
		$ids = Array();
		foreach ($idsarray as $id) {
			$ids[] = new Id($id['id'], $id['ident'], $id['hash']);
		}
		return $ids;
  }

  static function getNewId($ident) {
    if($ident == "NULL")
      $sident = "NULL";
    elseif($ident && strlen(trim($ident)) > 4)
      $sident = "'".trim($ident)."'";
    else
      $sident = "NULL";

    //generate some random unique hash
    $seed = 'hubbabubaPartyP30pl3';
    $hash = substr(sha1(uniqid($seed . mt_rand(), true)), 0, 32);

    $sql = "INSERT INTO ids (`ident`, `hash`) VALUES (".$sident.", '".$hash."');";
    $db = DB::getInstance();
    if(!$db->sql_query($sql)) {
      Log::debug("sql statement failed");
      return false;
    }
    $id = $db->sql_insert_id();
    
    return new Id($id, $ident, $hash);
  }
  
  function getId() {
    return $this->id;
  }
  
  function getIdent() {
    return $this->ident;
  }

  function getHash() {
    return $this->hash;
  }

}



?>
