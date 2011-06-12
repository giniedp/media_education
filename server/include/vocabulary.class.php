<?php

require_once('db.class.php');

class Vocabulary {

/*
SELECT v.id AS id, v.lang AS lang, v.voc AS origin, vv.lang AS target, vv.voc AS translation FROM `vocabulary` v 
JOIN translations t ON t.origin=v.id 
JOIN vocabulary vv ON vv.id=t.translation 
WHERE v.lang='de'
UNION
SELECT v.id AS id, v.lang AS lang, v.voc AS origin, vv.lang AS target, vv.voc AS translation FROM `vocabulary` v 
JOIN translations t ON t.translation=v.id 
JOIN vocabulary vv ON vv.id=t.origin 
WHERE v.lang='de' 
*/

  private $id;
  private $language;
  private $word;
  private $translations;
  private $translationLanguage;

  function Vocabulary($id, $language, $word, $translation, $translationLanguage) {
    $this->id = $id;
    $this->language = $language;
    $this->word = $word;
    $this->translations = Array();
    $this->translations[] = $translation;
    $this->translationLanguage = $translationLanguage;
  }
  
  function addTranslation($translation) {
    //TODO if not_in
    $this->translations[] = $translation;
  }
  
  function getData() {
    return array('origin' => $this->word, 
      'language' => $this->language, 
      'translations' => $this->translations,
      'translationLanguage' => $this->translationLanguage);
  }
  
  static function getVocabularies($lang, $targetLang, $random) {
    if($random) {
      $maxid = DB::queryAssocAtom("SELECT MAX(id) AS max FROM vocabulary");
      $maxid = $maxid['max'];
      Log::debug("maxid: ".$maxid);
      
      //get random ids...
      $randomIds = Array();
      $max = $maxid['max']>2?2:$maxid['max'];
      while (count($randomIds) < $max) {
        $x = rand(1,$maxid['max']);
        $found = false;
        for($i=0; $i<count($randomIds); $i++)
          if($randomIds[$i] == $x)
            $found = true;
        if(!$found)
          $randomIds[] = $x;
      }
      Log::debug("randomids: ".implode(",", $randomIds));
      $where = "AND v.id IN (". implode(",", $randomIds). ")";
    }
    
    
    $sql = "SELECT v.id AS id, v.voc AS origin, vv.voc AS translation FROM `vocabulary` v 
JOIN translations t ON t.origin=v.id 
JOIN vocabulary vv ON vv.id=t.translation 
WHERE v.lang='".$lang."' AND vv.lang='".$targetLang."' ".$where."
UNION
SELECT v.id AS id, v.voc AS origin, vv.voc AS translation FROM `vocabulary` v 
JOIN translations t ON t.translation=v.id 
JOIN vocabulary vv ON vv.id=t.origin 
WHERE v.lang='".$lang."' AND vv.lang='".$targetLang."' ".$where.";";

  //TODO order
  //1. query
		$vocsarray = DB::queryAssoc($sql);
		if ($vocsarray == null || count($vocsarray) == 0) {
			Log::debug("sql statement returned no vocabulary match");
			return false; // id(s) not found
		}
		Log::debug("got ".count($vocsarray)." vocabularies");
  //2. merge translations
  //3. create vocabulary[]
		$vocs = Array();
		$lastvocid = -1;
		$lastvoc = NULL;
		foreach ($vocsarray as $voc) {
		  if ($lastvocid == $voc['id'])
		    $lastvoc->addTranslation($voc['translation']);
		  else {
		    $lastvoc = new Vocabulary($voc['id'], $lang, $voc['origin'], $voc['translation'], $targetLang);
		    $lastvocid = $voc['id'];
			  $vocs[] = $lastvoc;
			}
		}
  //4. return
		return $vocs;
  }

  static function getSimilarVocabularies($sim) {
    $sql = "SELECT v.id AS id, v.voc AS origin, v.lang AS language, vv.voc AS translation, vv.lang AS translationLanguage FROM `vocabulary` v 
JOIN translations t ON t.origin=v.id 
JOIN vocabulary vv ON vv.id=t.translation 
WHERE v.voc LIKE '%".$sim."%'
UNION
SELECT v.id AS id, v.voc AS origin, v.lang AS language, vv.voc AS translation, vv.lang AS translationLanguage FROM `vocabulary` v 
JOIN translations t ON t.translation=v.id 
JOIN vocabulary vv ON vv.id=t.origin 
WHERE v.voc LIKE '%".$sim."%';";

  //TODO order
  //1. query
		$vocsarray = DB::queryAssoc($sql);
		if ($vocsarray == null || count($vocsarray) == 0) {
			Log::debug("sql statement returned no vocabulary match");
			return false; // id(s) not found
		}
		Log::debug("got ".count($vocsarray)." vocabularies");
  //2. merge translations
  //3. create vocabulary[]
		$vocs = Array();
		$lastvocid = -1;
		$lastvoc = NULL;
		foreach ($vocsarray as $voc) {
		  if ($lastvocid == $voc['id'])
		    $lastvoc->addTranslation($voc['translation']);
		  else {
		    $lastvoc = new Vocabulary($voc['id'], $voc['language'], $voc['origin'], $voc['translation'], $voc['translationLanguage']);
		    $lastvocid = $voc['id'];
			  $vocs[] = $lastvoc;
			}
		}
  //4. return
		return $vocs;
  }

}

?>
