<?php

require_once('db.class.php');

class Id {

  private $id;
  private $ident;
  
  function Id($id, $ident) {
    $this->id = $id;
    $this->ident = $ident;
  }
  
  static function getIdsForFBUsers($fbids) {
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
			$ids[] = new Id($id['id'], $id['ident']);
		}
		return $ids;
  }
  
  function getId() {
    return $this->id;
  }
  
  function getIdent() {
    return $this->ident;
  }

}



?>

